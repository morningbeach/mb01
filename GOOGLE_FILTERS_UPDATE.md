# Google Images 篩選器更新

## 🎯 問題解決

### 1. **白背景 + 白色商品問題**

#### 問題描述
當啟用「白背景模式」時，Google 會返回白背景圖片，但商品本身也常常是白色的，導致對比度差、視覺效果不佳。

#### 解決方案
**智慧查詢改寫**：在白背景模式下，自動修改搜尋查詢

**改善前**：
```typescript
// 只設定白背景參數
params.imgDominantColor = 'white';
```

**改善後**：
```typescript
// 白背景模式（但商品要有顏色）
if (enabledFilters.whiteBackground) {
  params.imgDominantColor = 'white';
  // 加入關鍵字確保商品本身有顏色
  params.q = `${searchQuery} colorful product vibrant -"white ${searchQuery.split(' ')[0]}"`;
}
```

**效果**：
- ✅ 保持白色背景
- ✅ 商品本身有顏色（colorful, vibrant）
- ✅ 排除「白色商品」描述（如 "white gift box"）

**範例查詢**：
- 原始輸入：`gift box`
- 實際查詢：`gift box colorful product vibrant -"white gift"`

---

### 2. **排除低品質清單優化**

當「白背景模式」啟用時，額外排除單色、全白商品描述：

```typescript
const excludeList = ['diy', 'handmade', 'cheap', 'lowres', 'screenshot'];

// 如果啟用白背景，額外排除「白色商品」描述
if (enabledFilters.whiteBackground) {
  excludeList.push('monochrome', 'all white', 'plain white');
}

params.excludeTerms = excludeList.join(' ');
```

**新增排除項目**：
- `monochrome`：單色圖片
- `all white`：全白商品
- `plain white`：純白設計

---

## 🤖 新增功能：使用 Apify Actor

### 動機
- Google Custom Search API 每次只能取得 10 筆，最多 100 筆
- Apify 的 Google Images Scraper 可以取得更多結果（200+）
- 適合需要大量圖片的場景

### 實作

#### 1. 新增 `useApify` 篩選器

**介面定義**：
```typescript
export interface GoogleImageFilters {
  whiteBackground?: boolean;
  highQuality?: boolean;
  recentOnly?: boolean;
  commercialUse?: boolean;
  productPhotography?: boolean;
  excludeLowQuality?: boolean;
  useApify?: boolean;  // 新增：使用 Apify Actor
}
```

#### 2. 雙模式支援

**lib/apify-adapters.ts**：
```typescript
async function fetchGoogleData(...) {
  // 如果啟用 Apify 模式，使用 Apify Actor
  if (filters?.useApify) {
    return fetchGoogleDataViaApify(keywords, limit, region, filters);
  }

  // 否則使用官方 Google Custom Search API
  // ... 原有邏輯
}
```

#### 3. Apify Actor 實作

**推薦 Actor**：`voyager/google-images-scraper`

**特點**：
- 更多結果（最多 200 筆）
- 無 API 配額限制（只受 Apify 用量限制）
- 自動處理分頁
- 回退機制（發生錯誤時自動切換回直接 API）

**輸入參數**：
```typescript
const input = {
  query: searchQuery,
  maxResults: Math.min(limit, 200),
  countryCode: region.toLowerCase(),
  resultsType: 'photos',
  safeSearch: false,
};
```

**錯誤處理**：
```typescript
try {
  // 嘗試使用 Apify
  const run = await client.actor(GOOGLE_SCRAPER_ID).call(input);
  // ...
} catch (error) {
  console.error(`[Apify] Google Images (Apify) error, falling back...`);
  // 自動回退到直接 API
  const fallbackAssets = await fetchGoogleData([keyword], limit - assets.length, region, { 
    ...filters, 
    useApify: false 
  });
}
```

---

## 🎨 前端 UI 更新

### 新增「使用 Apify」選項

**位置**：Google Images 進階篩選面板中，排除低品質選項後

**設計**：
```tsx
<label className="...cursor-pointer hover:border-indigo-300...">
  <input
    type="checkbox"
    checked={googleFilters.useApify}
    onChange={(e) => setGoogleFilters({ ...googleFilters, useApify: e.target.checked })}
  />
  <div>
    <div>
      🤖 使用 Apify Actor
      <span className="...bg-indigo-100 text-indigo-700...">進階</span>
    </div>
    <div className="text-xs text-gray-600">
      透過 Apify 爬蟲取得更多結果（需 token）
    </div>
  </div>
</label>
```

### 更新提示訊息

**動態提示**：
```typescript
{googleFilters.useApify 
  ? "Apify 模式可取得更多結果，但需要 APIFY_TOKEN 環境變數"
  : googleFilters.whiteBackground && googleFilters.highQuality
  ? "白背景模式會自動搜尋彩色商品，避免全白圖片"
  : "建議至少啟用「高品質模式」以獲得更好的結果"
}
```

---

## 📊 使用場景對比

### 場景 1：電商產品照（白背景 + 彩色商品）

**設定**：
```typescript
{
  whiteBackground: true,     // ✅ 白色背景
  highQuality: true,          // ✅ 高品質
  recentOnly: true,           // ✅ 最新
  commercialUse: true,        // ✅ 商用授權
  productPhotography: false,
  excludeLowQuality: true,
  useApify: false,            // 直接 API（速度快）
}
```

**搜尋行為**：
- 原始關鍵字：`gift box`
- 實際查詢：`gift box colorful product vibrant -"white gift"`
- 排除項目：`diy handmade cheap lowres screenshot monochrome all white plain white`

**預期結果**：
- ✅ 白色背景
- ✅ 商品有鮮豔顏色（紅、藍、綠、金色禮盒等）
- ✅ 高解析度電商產品照

---

### 場景 2：大量圖片採集（Apify 模式）

**設定**：
```typescript
{
  whiteBackground: true,
  highQuality: true,
  recentOnly: false,          // 不限時間（更多結果）
  commercialUse: false,       // 不限授權（更多結果）
  productPhotography: false,
  excludeLowQuality: true,
  useApify: true,             // ✅ 使用 Apify（更多結果）
}
```

**優點**：
- 可取得 200+ 張圖片（vs 官方 API 最多 100 張）
- 無 Google API 配額限制
- 適合建立大型圖片資料庫

**缺點**：
- 需要 APIFY_TOKEN 環境變數
- 速度較慢（約 3 分鐘）
- 需要 Apify 用量額度

---

## 🔧 環境變數

### Google Custom Search API（直接模式）

```env
GOOGLE_API_KEY=AIzaSy...
GOOGLE_CX=017576662512468239146:omuauf_lfve
```

**申請連結**：
- API Key: https://developers.google.com/custom-search/v1/introduction
- CX: https://programmablesearchengine.google.com/

---

### Apify Actor（Apify 模式）

```env
APIFY_TOKEN=apify_api_...
```

**申請連結**：
- https://console.apify.com/account/integrations

**推薦 Actor**：
- `voyager/google-images-scraper`
- `alexey/google-images-scraper`

---

## ✅ 測試檢查清單

### 白背景改善測試

1. **啟用白背景模式**
   - [ ] 搜尋 `gift box`
   - [ ] 確認圖片有白色背景
   - [ ] 確認商品本身有顏色（不是全白）

2. **查詢改寫檢查**
   - [ ] 查看 Console 日誌
   - [ ] 確認實際查詢包含 `colorful product vibrant`
   - [ ] 確認排除 `white gift` 等關鍵字

3. **排除清單驗證**
   - [ ] 查看 Console 的 excludeTerms
   - [ ] 確認包含 `monochrome all white plain white`

---

### Apify 模式測試

1. **前提條件**
   - [ ] 設定 `APIFY_TOKEN` 環境變數
   - [ ] 重啟開發伺服器

2. **啟用 Apify 模式**
   - [ ] 勾選「使用 Apify Actor」
   - [ ] 開始搜尋
   - [ ] 查看 Console 日誌：`[Apify] Google Images (via Apify) search`

3. **結果驗證**
   - [ ] 取得超過 100 張圖片（如果設定 limit > 100）
   - [ ] 圖片品質符合篩選條件
   - [ ] 查看執行時間（約 3 分鐘）

4. **回退機制測試**
   - [ ] 移除 `APIFY_TOKEN`
   - [ ] 勾選「使用 Apify Actor」
   - [ ] 確認自動回退到直接 API
   - [ ] Console 顯示：`APIFY_TOKEN not configured, falling back`

---

## 📝 已知限制

### Google Custom Search API（直接模式）

1. **結果數量**：最多 100 筆（10 頁）
2. **配額限制**：每日 100 次查詢（免費方案）
3. **速度**：快（每頁 0.5 秒間隔）

### Apify 模式

1. **需要 Token**：必須有 Apify 帳號和 token
2. **速度較慢**：約 3 分鐘超時設定
3. **用量計費**：根據 Apify 用量計費

---

## 🎯 建議使用策略

### 日常設計參考（推薦直接模式）

```typescript
{
  whiteBackground: true,
  highQuality: true,
  recentOnly: true,
  commercialUse: true,
  productPhotography: false,
  excludeLowQuality: true,
  useApify: false,  // ✅ 直接 API，速度快
}
```

**適合**：
- 快速搜尋設計靈感
- 每次 50-100 張圖片
- 需要即時結果

---

### 大量圖片採集（推薦 Apify 模式）

```typescript
{
  whiteBackground: false,  // 不限背景
  highQuality: true,
  recentOnly: false,       // 不限時間
  commercialUse: false,    // 不限授權
  productPhotography: false,
  excludeLowQuality: true,
  useApify: true,  // ✅ Apify Actor，更多結果
}
```

**適合**：
- 建立圖片資料庫
- 需要 200+ 張圖片
- 可接受較長等待時間

---

## 🚀 部署注意事項

### Vercel 環境變數

確保設定以下環境變數：

```bash
# Google Custom Search API（必須）
GOOGLE_API_KEY=your_key
GOOGLE_CX=your_cx

# Apify（選用，啟用 Apify 模式時需要）
APIFY_TOKEN=apify_api_your_token
```

### 效能優化建議

1. **快取機制**：考慮使用 Redis 快取搜尋結果（相同關鍵字 + 篩選條件）
2. **並行請求**：多個關鍵字可並行處理（目前已實作）
3. **圖片預載**：使用 Next.js Image 組件優化載入

---

## 📚 相關文件

- [GOOGLE_FILTERS_GUIDE.md](./GOOGLE_FILTERS_GUIDE.md) - 完整篩選器參數說明
- [lib/apify-adapters.ts](./lib/apify-adapters.ts) - 實作程式碼
- [app/admin/gift-box-radar/GiftBoxRadarClient.tsx](./app/admin/gift-box-radar/GiftBoxRadarClient.tsx) - 前端 UI

---

## 📞 支援

如有問題，請查看：
1. Console 日誌中的 `[Apify]` 開頭訊息
2. API 回應錯誤訊息
3. Apify Dashboard 的 Run 執行記錄

---

**更新日期**：2025-12-01
