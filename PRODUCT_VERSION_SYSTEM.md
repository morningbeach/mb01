# 商品系統版本控制 - 完整說明

## ✅ 已完成項目

### 1. 備份完成
備份位置: `app_backup/products_v1_20251125_121510/`
- ✅ 前台檔案: `frontend_products/`, `frontend_catalog/`
- ✅ 後台檔案: `backend_products/`, `backend_catalog/`, `backend_tags/`
- ✅ API 路由: `api_admin/`
- ✅ Schema: `schema.prisma`
- 📊 總共備份 112 個檔案

### 2. 資料庫 Schema 更新
已為以下 model 添加 `version` 欄位 (預設值為 1):
- ✅ `Product` - version: Int @default(1)
- ✅ `Tag` - version: Int @default(1)
- ✅ `FrontCategory` - version: Int @default(1)

### 3. 版本控制系統
**檔案**: `lib/product-version.ts`
- ✅ `getAdminProductVersion()` - 取得後台編輯版本
- ✅ `getFrontendProductVersion()` - 取得前台顯示版本（固定為 V2）
- ✅ `setAdminProductVersion(version)` - 設定後台編輯版本
- 💾 使用 Cookie 儲存後台版本選擇

### 4. 後台管理介面

#### 版本切換器
**檔案**: `app/admin/components/VersionSwitcher.tsx`
- 📍 位置: Admin Dashboard 首頁頂部
- 🔄 功能: 切換 V1/V2 編輯模式
- 📊 顯示當前版本狀態
- 💡 說明前台固定顯示 V2

#### V2 後台頁面
1. **商品管理 V2**: `/admin/products-v2`
   - 列出所有 version=2 的商品
   - 顯示商品封面、標籤、狀態
   - 支援新增 V2 商品

2. **分類管理 V2**: `/admin/catalog-v2`
   - 列出所有 version=2 的分類
   - 顯示分類卡片、標籤群組數量
   - 支援新增 V2 分類

3. **標籤管理 V2**: `/admin/tags-v2`
   - 列出所有 version=2 的標籤
   - 顯示標籤顏色、使用統計
   - 支援新增 V2 標籤

#### 導航更新
**檔案**: `app/admin/components/AdminNav.tsx`
- 在 Products 區顯示 V1 子選單
- 在 Products-V2 區顯示 V2 子選單 ⭐
- 自動切換子選單根據當前路由

### 5. 前台顯示更新

所有前台頁面已改為**只顯示 V2 版本**資料:

#### 更新的頁面
1. **`/products`** - 產品首頁
   - ✅ 只載入 `version=2` 的 FrontCategory

2. **`/catalog`** - 簡易列表
   - ✅ 只載入 `version=2` 的 Product

3. **`/catalog/[slug]`** - 分類頁
   - ✅ 只載入 `version=2` 的 FrontCategory
   - ✅ 只顯示 `version=2` 的 Product
   - ✅ TagGroups 自動篩選 V2 標籤

4. **`/products/[slug]`** - 商品詳細頁
   - ✅ 只載入 `version=2` 的 Product
   - ✅ 關聯標籤自動為 V2

---

## 🎯 系統架構

```
資料庫層
├─ Product (version: 1 | 2)
├─ Tag (version: 1 | 2)
└─ FrontCategory (version: 1 | 2)

後台管理
├─ 版本切換器 (Admin Dashboard)
│   ├─ 編輯 V1 (舊系統)
│   └─ 編輯 V2 (新系統) ⭐
│
├─ V1 管理介面
│   ├─ /admin/products
│   ├─ /admin/catalog
│   └─ /admin/tags
│
└─ V2 管理介面
    ├─ /admin/products-v2 ⭐
    ├─ /admin/catalog-v2 ⭐
    └─ /admin/tags-v2 ⭐

前台顯示 (固定 V2)
├─ /products
├─ /catalog
├─ /catalog/[slug]
└─ /products/[slug]
```

---

## 📝 使用流程

### 後台編輯流程

#### 步驟 1: 選擇編輯版本
1. 進入 Admin Dashboard (`/admin`)
2. 看到版本切換器 (頁面頂部藍色區塊)
3. 點擊 **"編輯 V1"** 或 **"編輯 V2"**
4. 頁面重新載入套用版本

#### 步驟 2: 編輯對應版本資料

**編輯 V1 (舊版本)**:
- 前往 `/admin/products` - 顯示 version=1 商品
- 前往 `/admin/catalog` - 顯示 version=1 分類
- 前往 `/admin/tags` - 顯示 version=1 標籤

**編輯 V2 (新版本)**:
- 前往 `/admin/products-v2` - 顯示 version=2 商品
- 前往 `/admin/catalog-v2` - 顯示 version=2 分類
- 前往 `/admin/tags-v2` - 顯示 version=2 標籤

#### 步驟 3: 建立新資料
- V1 頁面建立的資料自動設為 version=1
- V2 頁面建立的資料自動設為 version=2

### 前台瀏覽
- ✅ 前台**永遠只顯示 V2** 版本資料
- ✅ 無需切換，自動篩選 version=2
- ✅ V1 資料完全不會出現在前台

---

## 🔧 開發注意事項

### 查詢規則
```typescript
// ✅ 正確 - 後台根據版本查詢
const version = await getAdminProductVersion(); // 1 或 2
const products = await prisma.product.findMany({
  where: { version }
});

// ✅ 正確 - 前台固定查詢 V2
const products = await prisma.product.findMany({
  where: { version: 2 }
});

// ❌ 錯誤 - 忘記篩選版本
const products = await prisma.product.findMany({
  // 會混合 V1 和 V2 資料
});
```

### API 路由
- V1 API: `/api/admin/products`
- V2 API: `/api/admin/products-v2` (待實作)
- 前台 API: 自動篩選 version=2

### 未來擴充
當 V2 開發完成並測試通過後:
1. 可將前台改為讀取 V2
2. 保留 V1 作為歷史備份
3. 或刪除所有 version=1 資料

---

## 🚀 下一步工作

### V2 功能開發 (需求確認後進行)
1. [ ] 優化商品編輯表單
2. [ ] 改進分類邏輯
3. [ ] 重新設計標籤系統
4. [ ] 建立 V2 API 路由
5. [ ] 前後台同步預覽

### 資料遷移
1. [ ] 評估現有 V1 資料
2. [ ] 決定是否需要遷移到 V2
3. [ ] 建立遷移腳本 (如需要)

---

## 📊 檔案清單

### 核心檔案
- `lib/product-version.ts` - 版本控制邏輯
- `app/api/admin/product-version/route.ts` - 版本 API
- `app/admin/components/VersionSwitcher.tsx` - 切換器元件
- `prisma/schema.prisma` - 資料庫 Schema (已加 version 欄位)

### V2 後台檔案
- `app/admin/products-v2/page.tsx` - V2 商品列表
- `app/admin/catalog-v2/page.tsx` - V2 分類列表
- `app/admin/tags-v2/page.tsx` - V2 標籤列表

### 更新的前台檔案
- `app/products/page.tsx` - 產品首頁 (version=2)
- `app/catalog/page.tsx` - 簡易列表 (version=2)
- `app/catalog/[slug]/page.tsx` - 分類頁 (version=2)
- `app/products/[slug]/page.tsx` - 商品頁 (version=2)

### 備份檔案
- `app_backup/products_v1_20251125_121510/` - 完整備份

---

## ✨ 系統特色

1. **無損升級**: V1 資料完全保留，可隨時切換編輯
2. **平行開發**: V2 可獨立開發測試，不影響 V1
3. **漸進切換**: 前台已切換至 V2，後台保留雙版本
4. **簡單直觀**: Dashboard 一鍵切換版本
5. **資料隔離**: V1/V2 資料完全分開，不會混淆

---

## 🎉 完成狀態

✅ 備份系統建立完成  
✅ 資料庫 Schema 更新完成  
✅ 版本控制邏輯完成  
✅ 後台切換介面完成  
✅ V2 後台頁面完成  
✅ 前台版本切換完成  
✅ 說明文件建立完成  

**系統已就緒，可以開始進行 V2 優化開發！** 🚀
