# Google Images 進階篩選器使用說明

## 📋 可用篩選器

gift-box-radar 搜尋現在支援 Google Images 進階篩選，在發送 API 請求時加入 `googleFilters` 參數：

```typescript
{
  sources: ["google"],
  keywords: ["gift box"],
  limit: 50,
  googleFilters: {
    whiteBackground: true,      // 白背景模式
    highQuality: true,           // 高品質模式
    recentOnly: true,            // 僅最近2年內容
    commercialUse: true,         // 包含商業授權
    productPhotography: false,   // 產品攝影模式（限定電商網站）
    excludeLowQuality: true,     // 排除低品質內容
  }
}
```

## 🎯 篩選器詳細說明

### 1. **whiteBackground** (白背景模式)
- **預設**: `true`
- **效果**: 限定白色為主色調的圖片
- **適用**: 電商產品照、專業攝影
- **API 參數**: `imgDominantColor: 'white'`

### 2. **highQuality** (高品質模式)
- **預設**: `true`
- **效果**: 
  - 超大尺寸圖片 (`xlarge`)
  - 真實照片類型 (非插畫/線稿)
  - 彩色圖片
  - JPG 格式
  - 過濾重複內容
- **適用**: 需要高解析度的場景
- **API 參數**: 
  - `imgSize: 'xlarge'`
  - `imgType: 'photo'`
  - `imgColorType: 'color'`
  - `fileType: 'jpg'`
  - `filter: '1'`

### 3. **recentOnly** (僅最近內容)
- **預設**: `true`
- **效果**: 限制最近2年內上傳的圖片
- **適用**: 追蹤最新設計趨勢
- **API 參數**: `dateRestrict: 'y2'`
- **可調整**: 改為 `y1` (1年), `m6` (6個月), `m3` (3個月)

### 4. **commercialUse** (商業授權)
- **預設**: `true`
- **效果**: 包含各種 Creative Commons 授權的圖片
- **授權類型**:
  - 公共領域 (Public Domain)
  - 署名授權 (Attribution)
  - 相同方式共享 (ShareAlike)
  - 非商業使用 (NonCommercial)
  - 禁止演繹 (NoDerivatives)
- **API 參數**: `rights: 'cc_publicdomain,cc_attribute,...'`

### 5. **productPhotography** (產品攝影模式)
- **預設**: `false` ⚠️
- **效果**: 
  - 必須包含 "product photography" 關鍵字
  - 限定來自電商網站 (Amazon, Shopify, Etsy, Alibaba)
- **適用**: 尋找專業產品攝影照片
- **API 參數**: 
  - `exactTerms: 'product photography'`
  - `siteSearch: 'amazon.com,shopify.com,etsy.com,alibaba.com'`
  - `siteSearchFilter: 'i'`
- **注意**: 開啟此選項會大幅限制結果範圍

### 6. **excludeLowQuality** (排除低品質)
- **預設**: `true`
- **效果**: 排除包含以下關鍵字的結果
  - `diy` - DIY 手作
  - `handmade` - 手工製作
  - `cheap` - 廉價
  - `lowres` - 低解析度
  - `screenshot` - 螢幕截圖
- **API 參數**: `excludeTerms: 'diy handmade cheap lowres screenshot'`

---

## 💡 使用範例

### 範例 1: 電商產品照 (推薦設定)
```json
{
  "googleFilters": {
    "whiteBackground": true,
    "highQuality": true,
    "recentOnly": true,
    "commercialUse": true,
    "productPhotography": false,
    "excludeLowQuality": true
  }
}
```
**效果**: 白背景、高品質、最新、可商用的產品圖片

### 範例 2: 專業產品攝影（嚴格篩選）
```json
{
  "googleFilters": {
    "whiteBackground": true,
    "highQuality": true,
    "recentOnly": false,
    "commercialUse": false,
    "productPhotography": true,  // ✅ 開啟
    "excludeLowQuality": true
  }
}
```
**效果**: 僅來自電商網站的專業產品照

### 範例 3: 設計靈感（較寬鬆）
```json
{
  "googleFilters": {
    "whiteBackground": false,  // ❌ 關閉
    "highQuality": true,
    "recentOnly": true,
    "commercialUse": true,
    "productPhotography": false,
    "excludeLowQuality": false  // ❌ 關閉
  }
}
```
**效果**: 高品質、最新、可商用，但不限背景顏色

### 範例 4: 最新趨勢（超嚴格）
```json
{
  "googleFilters": {
    "whiteBackground": true,
    "highQuality": true,
    "recentOnly": true,
    "commercialUse": true,
    "productPhotography": true,
    "excludeLowQuality": true
  }
}
```
**效果**: 所有篩選器全開，結果最精準但數量最少

---

## 🔧 如何修改預設值

編輯 `lib/apify-adapters.ts` 第 361 行：

```typescript
const enabledFilters: GoogleImageFilters = {
  whiteBackground: true,        // 改為 false 關閉
  highQuality: true,             // 改為 false 關閉
  recentOnly: true,              // 改為 false 關閉
  commercialUse: true,           // 改為 false 關閉
  productPhotography: false,     // 改為 true 開啟
  excludeLowQuality: true,       // 改為 false 關閉
  ...filters, // API 傳入的設定會覆蓋預設值
};
```

---

## 📊 API 請求完整範例

```bash
POST /api/admin/gift-box-radar/search-stream

{
  "sources": ["google", "pinterest", "behance"],
  "keywords": ["luxury gift box", "premium packaging"],
  "region": "US",
  "limit": 50,
  "googleFilters": {
    "whiteBackground": true,
    "highQuality": true,
    "recentOnly": true,
    "commercialUse": true,
    "productPhotography": false,
    "excludeLowQuality": true
  }
}
```

---

## ⚠️ 注意事項

1. **篩選器僅適用於 Google Images**，不影響其他平台 (Pinterest, Behance 等)
2. **productPhotography** 會大幅減少結果數量，建議謹慎使用
3. **recentOnly** 預設為最近2年，可在程式碼中調整為 `y1`, `m6`, `m3`
4. 所有篩選器都是**可選的**，不傳 `googleFilters` 將使用預設設定
5. Google API 有 **每日配額限制**，請合理使用

---

## 🎨 前端整合指南

目前篩選器可透過 API 傳入，如需在 UI 中加入開關：

1. 在 `GiftBoxRadarClient.tsx` 加入狀態管理
2. 建立開關 UI 組件
3. 在搜尋請求中傳入 `googleFilters`

範例程式碼：
```typescript
const [googleFilters, setGoogleFilters] = useState({
  whiteBackground: true,
  highQuality: true,
  recentOnly: true,
  commercialUse: true,
  productPhotography: false,
  excludeLowQuality: true,
});

// 在搜尋時傳入
await fetch("/api/admin/gift-box-radar/search-stream", {
  method: "POST",
  body: JSON.stringify({
    sources,
    keywords,
    limit,
    googleFilters,  // ✅ 傳入篩選器
  }),
});
```

---

## 📝 版本記錄

- **v1.0** (2025-12-01): 初始版本，支援 6 個篩選器
- 後續可擴充更多篩選選項 (顏色、尺寸、網站等)
