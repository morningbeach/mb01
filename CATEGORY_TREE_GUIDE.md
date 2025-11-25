# 產品樹狀結構使用說明

## 📊 已完成項目

✅ **資料庫結構**
- CategoryNode 模型已創建
- 支援無限層級樹狀結構
- 自動計算 depth 和 path
- 支援中英雙語（可擴展多國語言）

✅ **種子資料**
- 82 個節點已寫入資料庫
- 5 大主分類：紙器包裝、提袋、餐具、禮品/商品、禮品組
- 包含 35 個葉節點（最終產品）
- 47 個分支節點（分類層級）

✅ **前台頁面**
- `/catalog-tree` - 主分類展示頁
- `/catalog-tree/tree-view` - 完整樹狀結構視覺化
- `/catalog-tree/[...slug]` - 動態路由（待更新）

✅ **API 端點**
- `/api/category-tree` - 前台樹狀結構 API
- `/api/admin/category-tree` - 後台管理 API

## 🎨 展示模式說明

每個節點都可以在後台設定以下展示模式：

### 1. hero-cards（大圖卡片）
適用於：**第一層主分類**
- 大型橫幅式卡片
- 背景漸層效果
- 適合展示主要產品線

### 2. grid（網格）
適用於：**第二、三層分類**
- 標準網格佈局
- 3-4 欄響應式排列
- 適合商品列表

### 3. masonry（瀑布流）
適用於：**第三層產品系列**
- 不規則高度排列
- Pinterest 風格
- 視覺效果豐富

### 4. waterfall（瀑布流）
適用於：**產品展示**
- 與 masonry 類似
- 流式排版
- 自動填充空白

### 5. carousel（輪播）
適用於：**精選商品**
- 橫向滑動展示
- 支援觸控滑動
- 適合推薦商品

### 6. list（列表）
適用於：**詳細資訊**
- 表格或列表式展示
- 顯示完整資訊
- 適合規格對比

### 7. product-detail（產品詳情）
適用於：**最終產品頁**
- 完整產品資訊
- 大圖展示
- 規格、價格、訂購資訊

## 🌲 當前樹狀結構

```
產品 (root, hidden)
├─ 紙器包裝 (hero-cards)
│  ├─ 精裝紙盒 (masonry)
│  │  ├─ 天地盒 (grid)
│  │  │  ├─ 豪華天地盒 A 型 (product-detail)
│  │  │  └─ 標準天地盒 B 型 (product-detail)
│  │  ├─ 掀蓋盒 (grid)
│  │  ├─ 茶盒 (waterfall)
│  │  ├─ 酒盒 (grid)
│  │  ├─ 化妝品盒 (masonry)
│  │  └─ 香水盒 (grid)
│  ├─ 平裝紙盒 (grid)
│  └─ 其他印刷品 (carousel)
├─ 提袋 (hero-cards)
│  ├─ 帆布袋 (masonry)
│  │  ├─ 平面袋 (grid)
│  │  ├─ 五面袋 (grid)
│  │  ├─ 托特袋 (waterfall)
│  │  ├─ 化妝包 (grid)
│  │  └─ 其他 (carousel)
│  ├─ PVC 提袋 (grid)
│  ├─ 編織袋 (masonry)
│  ├─ 不織布 (grid)
│  └─ 杜邦紙袋 (waterfall)
├─ 餐具 (hero-cards)
│  ├─ 杯具 (masonry)
│  ├─ 盤 (grid)
│  └─ 碗 (waterfall)
├─ 禮品/商品 (hero-cards)
│  ├─ 3C (grid)
│  │  ├─ 充電器 (masonry)
│  │  ├─ 藍芽喇叭 (grid)
│  │  ├─ 藍芽音箱 (waterfall)
│  │  ├─ 鍵盤 (carousel)
│  │  └─ 手機殼 (grid)
│  └─ 文具與日常 (masonry)
│     ├─ 陶瓷杯墊 (grid)
│     ├─ 矽膠杯墊 (waterfall)
│     └─ 化妝鏡 (carousel)
└─ 禮品組 (grid)
   ├─ 企業禮品組 A (product-detail)
   ├─ 企業禮品組 B (product-detail)
   └─ 節慶禮品組 (product-detail)
```

## 🔧 後台管理功能

### 現有功能
- ✅ 查看完整樹狀結構
- ✅ 節點統計資訊
- ✅ 創建新節點（API）

### 待開發功能
- 🟡 編輯節點資訊
- 🟡 刪除節點
- 🟡 拖放排序
- 🟡 批量匯入匯出
- 🟡 OpenAI 自動翻譯

## 🌐 多國語言整合

### 現有欄位
- `name_zh` / `name_en` - 名稱
- `description_zh` / `description_en` - 描述
- `seoTitle_zh` / `seoTitle_en` - SEO 標題
- `seoDescription_zh` / `seoDescription_en` - SEO 描述

### 未來擴展
可新增其他語言：
- `name_ja`, `description_ja` - 日文
- `name_ko`, `description_ko` - 韓文
- `name_es`, `description_es` - 西班牙文

## 🤖 OpenAI 翻譯整合（規劃中）

### 翻譯觸發點
1. **即時翻譯** - 編輯表單內的翻譯按鈕
2. **批量翻譯** - 整個分支批量翻譯
3. **自動翻譯** - 創建新節點時自動翻譯

### API 設計
```typescript
POST /api/admin/translate
{
  nodeId: string,
  sourceLang: 'zh',
  targetLang: 'en',
  fields: ['name', 'description', 'seoTitle', 'seoDescription']
}
```

### 翻譯快取
- 儲存翻譯歷史
- 減少 API 呼叫
- 成本控制

## 📝 下一步開發計畫

### 優先級 HIGH
1. 更新 `/catalog-tree/[...slug]/page.tsx` 使用真實資料
2. 建立後台節點編輯表單
3. 實作 OpenAI 翻譯 API

### 優先級 MEDIUM
4. 拖放排序功能
5. 批量匯入匯出
6. 節點刪除確認流程

### 優先級 LOW
7. 進階搜尋功能
8. 效能優化（快取）
9. 分析統計儀表板

## 🎯 使用範例

### 查詢第一層分類
```typescript
const categories = await prisma.categoryNode.findMany({
  where: {
    depth: 1,
    isActive: true,
    isHidden: false,
  },
  orderBy: { order: 'asc' },
});
```

### 查詢特定分類下的所有子分類
```typescript
const subcategories = await prisma.categoryNode.findMany({
  where: {
    parentId: 'parent-node-id',
    isActive: true,
  },
  orderBy: { order: 'asc' },
  include: {
    children: true,
  },
});
```

### 根據 slug 路徑查詢節點
```typescript
const node = await prisma.categoryNode.findUnique({
  where: { slug: 'paper-packaging' },
  include: {
    children: {
      where: { isActive: true },
      orderBy: { order: 'asc' },
    },
  },
});
```

## 📸 圖片使用

所有圖片目前使用 Unsplash 的相關主題圖片：
- 紙盒包裝
- 各式提袋
- 餐具杯盤
- 3C 產品
- 文具日用品

生產環境建議：
1. 上傳真實產品圖片到 Cloudflare R2
2. 更新 `coverImage` 和 `heroImage` 欄位
3. 使用 Next.js Image 元件優化載入

## 🔗 相關檔案

- `/lib/seed-category-tree.ts` - 種子資料腳本
- `/lib/category-tree-utils.ts` - 工具函數
- `/prisma/schema.prisma` - 資料庫結構
- `/app/catalog-tree/*` - 前台頁面
- `/app/api/category-tree/route.ts` - 前台 API
- `/app/api/admin/category-tree/route.ts` - 後台 API
