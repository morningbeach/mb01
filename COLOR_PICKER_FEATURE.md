# 🎨 顏色選擇器功能

## 新增功能

### 視覺化顏色選擇器

取代原本的「白背景模式」，新增兩個獨立的顏色選擇器：

#### 1. **背景顏色選擇器** 🎨
- 13 種顏色選項：不限、白、黑、灰、藍、紅、橙、黃、綠、青、紫、粉、棕
- 視覺化色塊按鈕
- 選中時顯示 ✓ 標記和外框
- Google API 原生支援的顏色

#### 2. **商品主色選擇器** 🎁
- 同樣 13 種顏色選項
- 獨立於背景色的選擇
- 精準控制商品的顏色

---

## UI 設計特點

### 顏色選擇器
```
┌─────────────────────────────────────┐
│ 🎨 背景顏色              🎁 商品主色 │
│ ┌───┬───┬───┬───┐    ┌───┬───┬───┐ │
│ │不限│白 │黑 │灰 │    │不限│白 │黑 │ │
│ └───┴───┴───┴───┘    └───┴───┴───┘ │
│ ┌───┬───┬───┬───┐    ┌───┬───┬───┐ │
│ │藍 │紅 │橙 │黃 │    │藍 │紅 │橙 │ │
│ └───┴───┴───┴───┘    └───┴───┴───┘ │
│ ┌───┬───┬───┬───┐    ┌───┬───┬───┐ │
│ │綠 │青 │紫 │粉 │    │綠 │青 │紫 │ │
│ └───┴───┴───┴───┘    └───┴───┴───┘ │
└─────────────────────────────────────┘
```

### 即時顏色組合預覽
選擇後立即顯示當前組合：
```
當前組合：[white 背景] + [red 商品]
```

### 智慧警告
- 背景色 = 商品色 → ⚠️ 提醒對比度不佳
- 白背景 + 任意商品 → 說明自動搜尋彩色商品
- 黑背景 + 任意商品 → 說明適合高級感設計

---

## 快速預設組（已更新）

### 1. ⚡ 電商產品照（白底彩品）
```typescript
backgroundColor: 'white'
productColor: 'any'
```
適合：電商平台、Shopify、Amazon

### 2. 📸 專業攝影（嚴格）
```typescript
backgroundColor: 'white'
productColor: 'any'
productPhotography: true
```
適合：專業攝影網站、高品質產品照

### 3. 🌙 黑底風格（高級感）
```typescript
backgroundColor: 'black'
productColor: 'any'
```
適合：奢侈品、高端設計、藝術風格

### 4. 🎁 紅色商品（節慶）
```typescript
backgroundColor: 'any'
productColor: 'red'
```
適合：春節、聖誕節、節慶禮盒

---

## 搜尋邏輯改進

### 背景色處理
```typescript
// Google API 參數
params.imgDominantColor = backgroundColor;
```

### 商品色處理
- 有指定商品色：`{keyword} {productColor} product`
- 白背景 + 無指定商品色：`{keyword} colorful product vibrant -"white {keyword}"`
- 其他：原始關鍵字

### 智慧排除
- 白背景 + 無指定商品色 → 排除 `monochrome`, `all white`, `plain white`
- 黑背景 + 無指定商品色 → 排除 `monochrome`, `all black`, `plain black`
- 背景色 = 商品色 → 排除 `monochrome`, `all {color}`

---

## 使用範例

### 範例 1：白底紅色禮盒
```typescript
backgroundColor: 'white'
productColor: 'red'
keyword: 'gift box'

實際查詢：
"gift box red product"
imgDominantColor: white
```

### 範例 2：黑底金色包裝
```typescript
backgroundColor: 'black'
productColor: 'yellow'  // 金色用黃色代替
keyword: 'luxury packaging'

實際查詢：
"luxury packaging yellow product"
imgDominantColor: black
```

### 範例 3：白底任意商品（自動彩色）
```typescript
backgroundColor: 'white'
productColor: 'any'
keyword: 'cosmetic box'

實際查詢：
"cosmetic box colorful product vibrant -white cosmetic"
imgDominantColor: white
excludeTerms: "... monochrome all white plain white"
```

### 範例 4：任意背景紫色商品
```typescript
backgroundColor: 'any'
productColor: 'purple'
keyword: 'jewelry box'

實際查詢：
"jewelry box purple product"
（無 imgDominantColor 限制）
```

---

## 支援的顏色

Google Custom Search API 支援的 imgDominantColor 值：

- `black` - 黑色
- `blue` - 藍色
- `brown` - 棕色
- `gray` - 灰色
- `green` - 綠色
- `orange` - 橙色
- `pink` - 粉色
- `purple` - 紫色
- `red` - 紅色
- `teal` - 青色
- `white` - 白色
- `yellow` - 黃色

---

## 技術實作

### 後端改動
**lib/apify-adapters.ts**：
- 新增 `backgroundColor` 和 `productColor` 欄位到 `GoogleImageFilters`
- 更新 `fetchGoogleData` 函數處理顏色參數
- 更新 `fetchGoogleDataViaApify` 函數處理顏色參數
- 智慧排除邏輯（根據顏色組合動態調整）

### 前端改動
**app/admin/gift-box-radar/GiftBoxRadarClient.tsx**：
- 新增顏色選擇器 UI（4x3 色塊網格 x 2）
- 即時顯示當前顏色組合
- 智慧提示（根據顏色組合給予建議）
- 更新快速預設組（包含顏色設定）

---

## 向後兼容

保留 `whiteBackground` 參數以向後兼容：
```typescript
const bgColor = filters?.backgroundColor || 
                (filters?.whiteBackground ? 'white' : undefined);
```

舊程式碼仍可正常運作，建議逐步遷移到新的 `backgroundColor` 參數。

---

**更新日期**：2025-12-01
