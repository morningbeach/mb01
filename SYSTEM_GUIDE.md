# MB Packaging 網站系統使用說明書

> 📅 更新日期：2025 年 11 月 26 日  
> 📦 版本：1.0.0  
> 🔧 技術棧：Next.js 14 + Prisma + PostgreSQL + Cloudflare R2 + TailwindCSS

---

## 📋 目錄

1. [系統概述](#系統概述)
2. [技術架構](#技術架構)
3. [資料庫結構](#資料庫結構)
4. [前台頁面結構](#前台頁面結構)
5. [後台管理系統](#後台管理系統)
6. [多語系系統](#多語系系統)
7. [產品版本控制](#產品版本控制)
8. [樹狀分類系統](#樹狀分類系統)
9. [圖片管理 (R2)](#圖片管理-r2)
10. [🆕 產品上架完整教學](#產品上架完整教學)
11. [部署指南](#部署指南)
12. [常用指令](#常用指令)
13. [檔案結構](#檔案結構)
14. [故障排除](#故障排除)

---

## 🌐 系統概述

MB Packaging 是一個專為禮品包裝產業設計的 B2B 電商網站系統，主要功能包括：

- **產品展示**：支援多種分類方式（樹狀結構、標籤篩選）
- **多語系支援**：中英雙語內容，支援 AI 自動翻譯
- **後台管理**：完整的 CMS 系統，可管理產品、分類、標籤、頁面
- **圖片雲端儲存**：整合 Cloudflare R2，高效管理產品圖片
- **部落格系統**：內建部落格功能，支援 SEO 優化
- **案例展示**：展示成功案例，提升品牌信任度

### 主要特色

| 功能 | 說明 |
|------|------|
| 🌍 多語系 | 中英雙語支援，OpenAI 自動翻譯 |
| 🗂️ 樹狀分類 | 無限層級產品分類結構 |
| 🏷️ 標籤系統 | 靈活的標籤篩選機制 |
| 📸 R2 圖床 | Cloudflare R2 雲端圖片儲存 |
| 🔄 版本控制 | V1/V2 平行開發，安全升級 |
| 📱 響應式 | 完整支援桌面、平板、手機 |

---

## 🏗️ 技術架構

```
┌─────────────────────────────────────────────────────────────┐
│                      前端 (Next.js 14)                       │
├─────────────────────────────────────────────────────────────┤
│  前台頁面              後台管理              API 路由        │
│  ├─ / (首頁)          ├─ /admin             ├─ /api/admin   │
│  ├─ /catalog          ├─ /admin/products    ├─ /api/pages   │
│  ├─ /catalog-tree     ├─ /admin/catalog     ├─ /api/images  │
│  ├─ /products         ├─ /admin/tags        ├─ /api/nav     │
│  ├─ /about            ├─ /admin/blog        └─ /api/...     │
│  ├─ /factory          ├─ /admin/pages                       │
│  ├─ /contact          └─ /admin/r2-manager                  │
│  ├─ /blog                                                    │
│  └─ /case                                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Prisma ORM + PostgreSQL                  │
├─────────────────────────────────────────────────────────────┤
│  Product, Tag, CategoryNode, FrontCategory, BlogPost,       │
│  SitePage, CaseProject, Image, Album, HomeSection...        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare R2 (圖片儲存)                 │
├─────────────────────────────────────────────────────────────┤
│  Bucket: gift-images                                         │
│  Public URL: https://img.mbpack.co                          │
└─────────────────────────────────────────────────────────────┘
```

### 技術棧明細

| 層級 | 技術 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Next.js | 14.2.5 | 前後端整合框架 |
| UI | TailwindCSS | 4.1.17 | 樣式框架 |
| ORM | Prisma | 6.19.0 | 資料庫操作 |
| 資料庫 | PostgreSQL | - | 主資料庫 |
| 圖床 | Cloudflare R2 | - | 圖片 CDN 儲存 |
| 部署 | Cloudflare Pages | - | 靜態網站部署 |
| AI | OpenAI GPT-4o-mini | - | 自動翻譯 |

---

## 🗄️ 資料庫結構

### 核心資料模型

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│     Product      │◄──►│    ProductTag    │◄──►│       Tag        │
│  (商品資料)       │    │   (多對多關聯)    │    │    (標籤)        │
└──────────────────┘    └──────────────────┘    └──────────────────┘
         │
         ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  CategoryNode    │    │  FrontCategory   │    │    SitePage      │
│  (樹狀分類)       │    │   (前台分類)      │    │   (頁面管理)     │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### 主要模型說明

#### 1. Product（商品）
```prisma
model Product {
  id             String    // 唯一識別碼
  slug           String    // URL 友善路徑
  name           String    // 商品名稱
  name_en        String?   // 英文名稱
  name_zh        String?   // 中文名稱
  category       Category  // 分類 (GIFT/GIFT_BOX/GIFT_SET)
  status         ProductStatus // 狀態 (DRAFT/ACTIVE/ARCHIVED)
  version        Int       // 版本 (1=舊版, 2=新版)
  coverImage     String?   // 封面圖
  gallery        String[]  // 圖片陣列
  tags           ProductTag[] // 關聯標籤
  ...
}
```

#### 2. CategoryNode（樹狀分類）
```prisma
model CategoryNode {
  id              String    // 唯一識別碼
  slug            String    // URL 路徑
  name_zh         String    // 中文名稱
  name_en         String    // 英文名稱
  parentId        String?   // 父節點 ID
  displayMode     String    // 展示模式
  depth           Int       // 層級深度
  isLeaf          Boolean   // 是否為葉節點
  tagIds          String[]  // 關聯標籤 ID
  ...
}
```

#### 3. SitePage（頁面管理）
```prisma
model SitePage {
  id          String    // 唯一識別碼
  slug        String    // 網址路徑
  type        PageType  // 頁面類型
  isDefault   Boolean   // 是否預設頁面
  isEnabled   Boolean   // 是否啟用
  showInNav   Boolean   // 是否顯示在導覽列
  pageData    Json?     // 結構化內容 (JSON)
  ...
}
```

---

## 🖥️ 前台頁面結構

### 路由對照表

| 路由 | 頁面 | 說明 |
|------|------|------|
| `/` | 首頁 | 使用 HomeSection 系統 |
| `/catalog` | 產品目錄 | 產品列表頁 |
| `/catalog/[slug]` | 分類頁 | 特定分類的產品 |
| `/catalog-tree` | 樹狀分類 | 新版樹狀結構分類 |
| `/catalog-tree/[...slug]` | 樹狀子分類 | 動態層級路由 |
| `/products/[slug]` | 產品詳情 | 單一產品頁面 |
| `/about` | 關於我們 | 品牌故事 |
| `/factory` | 工廠介紹 | 製程與設備 |
| `/contact` | 聯絡我們 | 聯絡表單 |
| `/blog` | 部落格 | 文章列表 |
| `/blog/[slug]` | 文章詳情 | 單篇文章 |
| `/case` | 案例展示 | 成功案例 |
| `/faq` | 常見問題 | FAQ 頁面 |
| `/process` | 合作流程 | 流程說明 |
| `/[slug]` | 自訂頁面 | 動態自訂頁面 |

### 語言切換

所有前台頁面支援 URL 參數切換語言：
- 英文：`/products/gift-box-a?lang=en`
- 中文：`/products/gift-box-a?lang=zh`

---

## 🔧 後台管理系統

### 後台入口

| 路由 | 功能 | 說明 |
|------|------|------|
| `/admin` | Dashboard | 管理首頁 |
| `/admin/login` | 登入 | 管理員登入 |
| `/admin/products` | 商品管理 V1 | 舊版商品 |
| `/admin/products-v2` | 商品管理 V2 | 新版商品 ⭐ |
| `/admin/catalog` | 分類管理 V1 | 舊版分類 |
| `/admin/catalog-v2` | 分類管理 V2 | 新版分類 ⭐ |
| `/admin/tags` | 標籤管理 V1 | 舊版標籤 |
| `/admin/tags-v2` | 標籤管理 V2 | 新版標籤 ⭐ |
| `/admin/category-tree` | 樹狀分類管理 | 管理樹狀結構 |
| `/admin/blog` | 部落格管理 | 文章編輯 |
| `/admin/pages` | 頁面管理 | 自訂頁面 |
| `/admin/homepage` | 首頁管理 | 首頁區塊編輯 |
| `/admin/r2-manager` | 圖片管理 | R2 圖床管理 |
| `/admin/images` | 圖片庫 | 圖片資產管理 |

### 後台功能

#### 1. 商品管理
- 新增/編輯/刪除商品
- 多語系內容編輯
- AI 翻譯功能
- 圖片上傳與排序
- 標籤關聯設定

#### 2. 分類管理
- 前台分類 (FrontCategory)
- 樹狀分類 (CategoryNode)
- 標籤群組設定

#### 3. 頁面管理
- 預設頁面編輯（About, Factory, Contact）
- 自訂頁面建立
- SEO 設定

#### 4. 首頁管理
- 區塊拖曳排序
- 內容即時編輯
- 區塊類型：HERO, WHY, PRODUCTS, FACTORY, BLOG, CTA, RICH_TEXT, GALLERY, VIDEO

---

## 🌍 多語系系統

### 支援語言
- 🇺🇸 English (en)
- 🇹🇼 繁體中文 (zh)

### 欄位命名規則
```
{欄位名稱}      → 預設/向下相容
{欄位名稱}_en   → 英文版本
{欄位名稱}_zh   → 中文版本
```

範例：
```typescript
{
  name: "Gift Box",      // 預設
  name_en: "Gift Box",   // 英文
  name_zh: "禮盒"        // 中文
}
```

### AI 翻譯功能

#### API 端點
```
POST /api/translate
```

#### 請求格式
```json
{
  "text": "要翻譯的文字",
  "from": "en",
  "to": "zh",
  "context": "product_name"  // product_name, description, seo_title, seo_description
}
```

#### 設定 OpenAI API Key
```env
# .env.local
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

#### 費用估算
- 使用 GPT-4o-mini 模型
- 每 1000 個欄位約 $0.075 USD（約 NT$2.3）

---

## 🔄 產品版本控制

### 版本說明

| 版本 | 用途 | 前台顯示 |
|------|------|---------|
| V1 | 舊版資料（保留備份） | ❌ |
| V2 | 新版資料（正式使用） | ✅ |

### 運作機制
- **前台**：固定只顯示 `version=2` 的資料
- **後台**：可切換編輯 V1 或 V2

### 後台切換
1. 進入 `/admin`
2. 使用版本切換器選擇 V1 或 V2
3. 對應的管理頁面會顯示對應版本資料

### 查詢範例
```typescript
// 前台：固定查詢 V2
const products = await prisma.product.findMany({
  where: { version: 2 }
});

// 後台：根據設定查詢
const version = await getAdminProductVersion();
const products = await prisma.product.findMany({
  where: { version }
});
```

---

## 🌲 樹狀分類系統

### 結構設計
```
產品 (root, hidden)
├─ 紙器包裝 (hero-cards)
│  ├─ 精裝紙盒 (masonry)
│  │  ├─ 天地盒 (grid)
│  │  │  ├─ 豪華天地盒 A 型 (product-detail)
│  │  │  └─ 標準天地盒 B 型 (product-detail)
│  │  └─ 掀蓋盒 (grid)
│  └─ 平裝紙盒 (grid)
├─ 提袋 (hero-cards)
│  ├─ 帆布袋 (masonry)
│  └─ PVC 提袋 (grid)
├─ 餐具 (hero-cards)
├─ 禮品/商品 (hero-cards)
└─ 禮品組 (grid)
```

### 展示模式 (displayMode)

| 模式 | 適用場景 | 說明 |
|------|----------|------|
| `hero-cards` | 第一層主分類 | 大型橫幅式卡片 |
| `grid` | 二、三層分類 | 標準網格佈局 |
| `masonry` | 產品系列 | Pinterest 瀑布流 |
| `waterfall` | 產品展示 | 流式排版 |
| `carousel` | 精選商品 | 橫向輪播 |
| `list` | 詳細資訊 | 列表式展示 |
| `product-detail` | 最終產品頁 | 完整產品資訊 |

### API 端點
- 前台：`GET /api/category-tree`
- 後台：`GET/POST/PUT/DELETE /api/admin/category-tree`

---

## 📸 圖片管理 (R2)

### Cloudflare R2 設定
```env
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxx
R2_ENDPOINT=https://xxxxxxxx.r2.cloudflarestorage.com
R2_BUCKET_NAME=gift-images
R2_PUBLIC_BASE_URL=https://img.mbpack.co
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

### 上傳 API
```
POST /api/upload-image
Content-Type: multipart/form-data
```

### 圖片管理後台
- `/admin/r2-manager` - R2 檔案瀏覽器
- `/admin/images` - 圖片資產管理

### 圖片 URL 格式
```
https://img.mbpack.co/{folder}/{filename}
```

---

## 📦 產品上架完整教學

本章節提供詳細的產品上架操作流程，從準備資料到發布上線的完整步驟。

### 📋 上架前準備清單

在開始上架產品前，請先準備以下資料：

#### 必備資料
| 項目 | 說明 | 範例 |
|------|------|------|
| 產品名稱 | 中英文名稱 | Premium Gift Box / 豪華禮品盒 |
| URL Slug | 英文網址路徑（唯一） | `premium-gift-box-a` |
| 產品分類 | GIFT / GIFT_BOX / GIFT_SET | GIFT_BOX |
| 封面圖片 | 主要展示圖（建議 800×800 以上） | 1 張 |
| 產品圖片 | 多角度展示圖 | 3-8 張 |

#### 建議資料
| 項目 | 說明 | 範例 |
|------|------|------|
| 簡短描述 | 一句話說明產品特色 | 高級天地盒結構，適合高端禮品包裝 |
| 詳細描述 | 完整產品介紹 | 採用進口特種紙，內襯絨布... |
| 產品規格 | 尺寸、材質、重量 | 20 × 15 × 8 cm |
| SKU 編號 | 內部產品編號 | MB-BOX-001 |
| 最小訂購量 | MOQ | 500 |
| 價格提示 | 參考價格範圍 | 每個 $5.50 起 |
| 交期 | 生產時間 | 15-20 個工作天 |
| 產品標籤 | 用於分類篩選 | 天地盒、高端、客製化 |

---

### 🚀 Step 1：進入產品管理後台

1. **開啟後台**
   - 網址：`https://your-domain.com/admin`
   - 或本地開發：`http://localhost:3000/admin`

2. **進入 V2 產品管理**
   - 點擊左側選單「Products V2」
   - 或直接訪問 `/admin/products-v2`

3. **點擊新增商品**
   - 點擊右上角「+ 新增商品」按鈕
   - 進入產品編輯頁面

> ⚠️ **重要**：請使用 V2 版本（`/admin/products-v2`），V1 版本資料不會顯示在前台！

---

### 📝 Step 2：填寫基本資訊

#### 2.1 產品名稱（必填）

產品名稱支援中英雙語輸入：

```
┌─────────────────────────────────────────────────────────┐
│  產品名稱 / Product Name *                               │
├─────────────────────────────────────────────────────────┤
│  🇺🇸 English                            [翻譯成中文 →]   │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Premium Heaven-Earth Gift Box Type A            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  🇹🇼 繁體中文                            [翻譯成英文 →]   │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 豪華天地盒 A 型                                  │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**AI 翻譯功能**：
- 輸入其中一種語言後，點擊「翻譯」按鈕
- 系統會自動使用 OpenAI 翻譯成另一種語言
- 翻譯結果可手動調整

#### 2.2 URL Slug（必填）

```
URL Slug: premium-heaven-earth-gift-box-a
```

**命名規則**：
- ✅ 使用小寫英文字母
- ✅ 使用連字號 `-` 分隔單字
- ✅ 簡短且有意義
- ❌ 不可使用中文
- ❌ 不可使用空格
- ❌ 不可與其他產品重複

**網址呈現**：`/products/premium-heaven-earth-gift-box-a`

#### 2.3 簡短描述

一句話描述產品特色，會顯示在產品列表卡片上：

| 語言 | 範例 |
|------|------|
| 英文 | Luxury heaven-and-earth box structure with velvet lining, perfect for premium corporate gifts |
| 中文 | 高級天地盒結構，內襯絨布，適合高端企業禮品包裝 |

#### 2.4 詳細描述

完整的產品介紹，支援多段落：

**英文範例**：
```
Crafted with imported specialty paper, our Premium Heaven-Earth Gift Box 
features an elegant magnetic closure and plush velvet lining. 

Key Features:
• Rigid box construction for durability
• Soft-touch lamination exterior
• Custom hot stamping available
• Food-grade interior (optional)

Perfect for luxury cosmetics, jewelry, watches, and corporate gifts.
```

**中文範例**：
```
採用進口特種紙製作，豪華天地盒配備優雅磁吸式開合設計及柔軟絨布內襯。

產品特色：
• 硬盒結構，堅固耐用
• 外層柔觸膜處理
• 可客製燙金 Logo
• 可選食品級內襯

適用於高端化妝品、珠寶、手錶及企業禮品包裝。
```

#### 2.5 產品分類（必填）

| 分類 | 英文 | 適用產品 |
|------|------|----------|
| 禮品贈品 | GIFT | 單一禮品、贈品、3C 配件 |
| 禮品盒 | GIFT_BOX | 各式包裝盒、紙盒 |
| 禮品組 | GIFT_SET | 組合包、禮籃、套組 |

#### 2.6 SKU 產品編號（選填）

內部管理用的唯一編號：
```
SKU: MB-BOX-HE-001
```

**建議編碼規則**：
- `MB` - 公司代號
- `BOX` - 產品類型
- `HE` - 子類型（Heaven-Earth 天地盒）
- `001` - 流水號

---

### 📐 Step 3：填寫產品規格

#### 3.1 尺寸 Dimensions

| 語言 | 範例 |
|------|------|
| 英文 | 20 × 15 × 8 cm (L × W × H) |
| 中文 | 20 × 15 × 8 公分（長 × 寬 × 高） |

#### 3.2 材質 Materials

| 語言 | 範例 |
|------|------|
| 英文 | 1200g grey board, 157g coated art paper, velvet lining |
| 中文 | 1200g 灰紙板、157g 銅版紙、絨布內襯 |

#### 3.3 交期 Lead Time

| 語言 | 範例 |
|------|------|
| 英文 | 15-20 business days after artwork approval |
| 中文 | 確認稿件後 15-20 個工作天 |

#### 3.4 包裝資訊 Packaging Info

| 語言 | 範例 |
|------|------|
| 英文 | 12 pcs/carton, Carton size: 45 × 35 × 40 cm |
| 中文 | 12 個/箱，外箱尺寸：45 × 35 × 40 公分 |

---

### 💰 Step 4：填寫商業資訊

#### 4.1 最小訂購量 MOQ

```
最小訂購量: 500
```

#### 4.2 幣別 Currency

| 選項 | 說明 |
|------|------|
| TWD | 新台幣 |
| USD | 美金 |
| EUR | 歐元 |

#### 4.3 價格提示 Price Hint

| 語言 | 範例 |
|------|------|
| 英文 | From $5.50/pc (MOQ 500), volume discount available |
| 中文 | 每個 $5.50 起（最小訂購量 500），量大另議 |

> 💡 **提示**：價格提示僅供參考，實際報價請客戶聯繫業務

---

### 🖼️ Step 5：上傳產品圖片

#### 5.1 封面圖片（Cover Image）

這是產品的主要展示圖，會顯示在：
- 產品列表卡片
- 產品詳情頁頂部
- 社群分享預覽

**規格建議**：
- 尺寸：800 × 800 px 以上（建議 1200 × 1200）
- 格式：JPG / PNG / WebP
- 大小：< 2MB
- 背景：純白或淺灰色

**上傳方式**：
1. 點擊「選擇圖片」按鈕
2. 從 R2 圖片庫選擇，或上傳新圖片
3. 確認圖片後自動填入 URL

#### 5.2 圖片庫（Image Gallery）

產品的多角度展示圖，會顯示在產品詳情頁的圖片輪播區。

**建議數量**：3-8 張

**建議包含**：
| 順序 | 圖片類型 | 說明 |
|------|----------|------|
| 1 | 主圖 | 與封面圖相同或類似 |
| 2 | 45° 角度 | 展示立體感 |
| 3 | 打開狀態 | 展示內部結構 |
| 4 | 細節特寫 | 材質、工藝細節 |
| 5 | 尺寸參考 | 放入產品或手持對比 |
| 6 | 情境圖 | 實際使用場景 |

**上傳後可拖曳排序**：
```
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│  1  │ │  2  │ │  3  │ │  4  │
│ [✕] │ │ [✕] │ │ [✕] │ │ [✕] │
└─────┘ └─────┘ └─────┘ └─────┘
   ↑ 拖曳調整順序 / 點擊 ✕ 刪除
```

---

### 🏷️ Step 6：設定產品標籤

標籤用於產品分類和篩選，一個產品可以有多個標籤。

#### 選擇標籤

從已建立的標籤中勾選相關項目：

```
☑ 天地盒        ☑ 客製化        ☐ 環保材質
☑ 高端禮品      ☐ 食品包裝      ☑ 磁吸設計
☐ 企業贈品      ☑ 節慶禮盒      ☐ 小量訂製
```

#### 標籤用途

| 用途 | 說明 |
|------|------|
| 前台篩選 | 客戶可透過標籤快速找到相關產品 |
| 樹狀分類 | 樹狀節點可綁定標籤，自動顯示該標籤的產品 |
| 內部管理 | 方便後台搜尋和整理 |

> 💡 **提示**：如需新增標籤，請先到 `/admin/tags-v2` 建立

---

### 🔍 Step 7：設定 SEO

SEO 設定會影響 Google 搜尋結果的顯示。

#### 7.1 SEO 標題

| 語言 | 範例 | 字數限制 |
|------|------|----------|
| 英文 | Premium Heaven-Earth Gift Box | Custom Packaging | 50-60 字元 |
| 中文 | 豪華天地盒 A 型 | 客製化禮品包裝 | 25-30 字 |

**搜尋結果呈現**：
```
Premium Heaven-Earth Gift Box | Custom Packaging
https://your-domain.com/products/premium-heaven-earth-gift-box-a
High-quality rigid gift box with velvet lining, perfect for...
```

#### 7.2 SEO 描述

| 語言 | 範例 | 字數限制 |
|------|------|----------|
| 英文 | High-quality rigid gift box with velvet lining, magnetic closure. Custom branding available. MOQ 500 pcs. | 150-160 字元 |
| 中文 | 高品質硬盒結構，絨布內襯，磁吸開合設計。可客製化品牌印刷。最小訂購量 500 個。 | 70-80 字 |

---

### ✅ Step 8：設定發布狀態

| 狀態 | 英文 | 說明 | 前台顯示 |
|------|------|------|----------|
| 草稿 | DRAFT | 編輯中，尚未完成 | ❌ 不顯示 |
| 已發布 | ACTIVE | 正式上架 | ✅ 顯示 |
| 已封存 | ARCHIVED | 下架/停售 | ❌ 不顯示 |

**建議流程**：
1. 新建產品時選擇「草稿」
2. 資料填寫完整後改為「已發布」
3. 需要下架時改為「已封存」

---

### 💾 Step 9：儲存並預覽

#### 9.1 儲存產品

點擊「建立產品」或「更新產品」按鈕：

```
┌────────────────────────────────────────────────────────┐
│  [建立產品]                    [取消]                   │
└────────────────────────────────────────────────────────┘
```

儲存成功後會自動跳轉回產品列表。

#### 9.2 預覽產品

前往前台預覽上架效果：

- 英文版：`/products/{slug}?lang=en`
- 中文版：`/products/{slug}?lang=zh`

範例：
```
https://your-domain.com/products/premium-heaven-earth-gift-box-a?lang=zh
```

---

### 📋 產品上架檢查清單

上架前請確認以下項目：

#### 基本資料
- [ ] 產品名稱（中英文）已填寫
- [ ] URL Slug 命名正確且唯一
- [ ] 產品分類已選擇
- [ ] 簡短描述已填寫
- [ ] 詳細描述已填寫

#### 圖片
- [ ] 封面圖片已上傳
- [ ] 至少 3 張產品圖片
- [ ] 圖片解析度足夠（800px 以上）
- [ ] 圖片順序正確

#### 規格資訊
- [ ] 尺寸資訊已填寫
- [ ] 材質資訊已填寫
- [ ] 交期資訊已填寫

#### 商業資訊
- [ ] 最小訂購量已設定
- [ ] 價格提示已填寫

#### 分類標籤
- [ ] 已選擇相關標籤
- [ ] 標籤數量適中（3-6 個）

#### SEO
- [ ] SEO 標題已填寫
- [ ] SEO 描述已填寫

#### 最終確認
- [ ] 狀態設為「已發布」
- [ ] 前台預覽正常顯示
- [ ] 中英文切換正常

---

### ❓ 常見問題

#### Q1: 產品儲存後在前台看不到？
**A**: 請確認：
1. 狀態是否為「已發布」（ACTIVE）
2. 產品版本是否為 V2（必須在 `/admin/products-v2` 建立）
3. 清除瀏覽器快取後重試

#### Q2: 圖片上傳失敗？
**A**: 請確認：
1. 圖片大小 < 10MB
2. 格式為 JPG / PNG / WebP
3. R2 設定正確

#### Q3: AI 翻譯按鈕沒有反應？
**A**: 請確認：
1. `.env.local` 已設定 `OPENAI_API_KEY`
2. API Key 有效且有餘額
3. 網路連線正常

#### Q4: 如何批次上架多個產品？
**A**: 目前需逐一上架。如需大量匯入，可聯繫開發團隊協助資料庫直接寫入。

#### Q5: 產品上架後可以修改 Slug 嗎？
**A**: 可以，但會影響 SEO 和已分享的連結。建議：
- 設定 301 轉址（需額外開發）
- 或保持 Slug 不變

---

## 🚀 部署指南

### 環境變數

```env
# 資料庫
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# R2 圖床
R2_ACCOUNT_ID=xxxxxxxx
R2_ENDPOINT=https://xxxxxxxx.r2.cloudflarestorage.com
R2_BUCKET_NAME=gift-images
R2_PUBLIC_BASE_URL=https://img.mbpack.co
R2_ACCESS_KEY_ID=xxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxx

# OpenAI（可選，用於自動翻譯）
OPENAI_API_KEY=sk-xxxxxxxx
```

### Cloudflare Pages 部署

#### 方法一：Dashboard 部署（推薦）
1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 進入 Pages → Create a project
3. 連接 GitHub Repository
4. 設定建置配置：
   ```
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: .next
   Node version: 18.17.0
   ```
5. 添加環境變數
6. 部署

#### 方法二：Wrangler CLI
```bash
# 登入
wrangler login

# 建置
npm run build

# 部署
wrangler pages deploy .next --project-name=mb-packaging
```

### 部署後驗證
- [ ] 首頁正常載入
- [ ] `/admin` 後台可登入
- [ ] 圖片從 R2 正常顯示
- [ ] 產品頁面運作正常
- [ ] 分類樹狀結構瀏覽正常
- [ ] TAG 篩選功能正常
- [ ] 資料庫連線正常

---

## ⌨️ 常用指令

### 開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置
npm run build

# 啟動生產模式
npm start
```

### Prisma 資料庫

```bash
# 產生 Prisma Client
npx prisma generate

# 推送 Schema 到資料庫
npx prisma db push

# 強制推送（會刪除資料）
npx prisma db push --accept-data-loss

# 開啟 Prisma Studio（資料庫 GUI）
npx prisma studio

# 執行 Seed
npx ts-node prisma/seed.ts
```

### 特殊 Seed 腳本

```bash
# 種子頁面資料
npx ts-node prisma/seed-pages.ts

# 種子樹狀分類資料
npx ts-node lib/seed-category-tree.ts

# 種子標籤 V2 資料
npx ts-node lib/seed-tags-v2.ts

# 種子產品 V2 資料
npx ts-node lib/seed-products-v2.ts
```

### 翻譯腳本

```bash
# 檢查翻譯狀態
node scripts/check-translation-status.js

# 翻譯產品
node scripts/translate-products.js

# 遷移產品到雙語
node scripts/migrate-products-to-bilingual.js
```

### Cloudflare 部署

```bash
# Cloudflare Pages 建置
npm run pages:build

# 本地預覽
npm run preview

# 部署
npm run deploy
```

---

## 📁 檔案結構

```
mb01/
├── app/                          # Next.js App Router
│   ├── globals.css               # 全域樣式
│   ├── layout.tsx                # 根佈局
│   ├── page.tsx                  # 首頁
│   ├── [slug]/                   # 動態自訂頁面
│   ├── about/                    # 關於我們
│   ├── admin/                    # 後台管理 ⭐
│   │   ├── products/             # 商品管理 V1
│   │   ├── products-v2/          # 商品管理 V2
│   │   ├── catalog/              # 分類管理 V1
│   │   ├── catalog-v2/           # 分類管理 V2
│   │   ├── tags/                 # 標籤管理 V1
│   │   ├── tags-v2/              # 標籤管理 V2
│   │   ├── category-tree/        # 樹狀分類管理
│   │   ├── blog/                 # 部落格管理
│   │   ├── pages/                # 頁面管理
│   │   ├── homepage/             # 首頁管理
│   │   ├── r2-manager/           # R2 圖片管理
│   │   └── components/           # 後台共用元件
│   ├── api/                      # API 路由
│   │   ├── admin/                # 後台 API
│   │   ├── category-tree/        # 樹狀分類 API
│   │   ├── images/               # 圖片 API
│   │   ├── nav/                  # 導覽列 API
│   │   ├── pages/                # 頁面 API
│   │   ├── translate/            # 翻譯 API
│   │   └── upload-image/         # 上傳 API
│   ├── blog/                     # 部落格頁面
│   ├── case/                     # 案例頁面
│   ├── catalog/                  # 產品目錄
│   ├── catalog-tree/             # 樹狀分類
│   ├── contact/                  # 聯絡我們
│   ├── contexts/                 # React Context
│   ├── factory/                  # 工廠介紹
│   ├── faq/                      # FAQ
│   └── process/                  # 合作流程
├── components/                   # 共用元件
├── lib/                          # 工具函數
│   ├── db.ts                     # 資料庫連線
│   ├── prisma.ts                 # Prisma Client
│   ├── r2.ts                     # R2 操作
│   ├── product-version.ts        # 版本控制
│   ├── category-tree-utils.ts    # 樹狀分類工具
│   └── seed-*.ts                 # 種子資料腳本
├── prisma/                       # Prisma
│   ├── schema.prisma             # 資料庫 Schema ⭐
│   ├── seed.ts                   # 主種子腳本
│   └── migrations/               # 資料庫遷移
├── public/                       # 靜態檔案
├── scripts/                      # 腳本工具
├── package.json                  # 專案設定
├── next.config.js                # Next.js 設定
├── tailwind.config.js            # TailwindCSS 設定
├── tsconfig.json                 # TypeScript 設定
└── wrangler.toml                 # Cloudflare 設定
```

---

## ❓ 故障排除

### 常見問題

#### 1. Prisma Client 錯誤
```bash
# 重新產生 Client
npx prisma generate
```

#### 2. 資料庫連線失敗
- 確認 `DATABASE_URL` 環境變數正確
- 確認資料庫伺服器可從外部連線
- 確認 `sslmode=require` 設定

#### 3. 圖片無法顯示
- 確認 R2 環境變數正確
- 確認 R2 Bucket 的 CORS 設定
- 確認 Public URL 正確

#### 4. 建置失敗
```bash
# 清除快取重新建置
Remove-Item -Recurse -Force .next
npm run build
```

#### 5. 開發伺服器佔用 Port
```bash
# 終止 Node 程序
Stop-Process -Name node -Force
```

### 除錯工具

| 路由 | 功能 |
|------|------|
| `/admin/debug` | 系統除錯資訊 |
| `/admin/debug-r2` | R2 連線測試 |

### 日誌查看
```bash
# 開發模式會在終端機顯示日誌
npm run dev
```

---

## 📚 相關文件

| 文件 | 說明 |
|------|------|
| `BILINGUAL_PRODUCT_SYSTEM.md` | 多語系系統詳細說明 |
| `PRODUCT_VERSION_SYSTEM.md` | 版本控制系統說明 |
| `CATEGORY_TREE_GUIDE.md` | 樹狀分類系統說明 |
| `DEPLOYMENT.md` | 完整部署指南 |
| `DEPLOY_NOW.md` | 快速部署步驟 |
| `READY_TO_DEPLOY.md` | 部署準備清單 |

---

## 🎯 快速參考

### 新增一個產品
1. 進入 `/admin/products-v2`
2. 點擊「新增商品」
3. 填寫中英文資料（可使用 AI 翻譯）
4. 上傳圖片
5. 選擇標籤
6. 儲存

### 新增一個分類節點
1. 進入 `/admin/category-tree`
2. 選擇父節點
3. 點擊「新增子節點」
4. 填寫中英文名稱
5. 選擇展示模式
6. 儲存

### 編輯首頁
1. 進入 `/admin/homepage`
2. 拖曳調整區塊順序
3. 點擊區塊編輯內容
4. 儲存變更

### 上傳圖片
1. 進入 `/admin/r2-manager`
2. 選擇目標資料夾
3. 上傳圖片
4. 複製圖片 URL 使用

---

## ✨ 系統維護

### 定期備份
建議定期備份資料庫：
```bash
pg_dump -h host -U user -d database > backup.sql
```

### 更新依賴
```bash
npm update
npx prisma generate
```

### 監控
- Cloudflare Pages 提供免費的網站分析
- 可整合 Google Analytics

---

**📧 技術支援**：如有問題，請參考上述故障排除或聯繫開發團隊。

---

*最後更新：2025/11/26*
