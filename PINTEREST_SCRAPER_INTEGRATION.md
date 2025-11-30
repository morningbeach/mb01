# Pinterest Search Scraper 整合文件

## 概述

本專案整合了 Apify 的 Pinterest Search Scraper 來抓取 Pinterest 搜尋結果，支援多查詢詞順序執行，並將結果儲存到資料庫或檔案系統。

**使用的 Actor**：`apify/web-scraper` - Apify 官方免費 Web Scraper 搭配自訂 pageFunction

**重要說明**：所有第三方 Pinterest 專用 Actors 都需要付費，因此使用已驗證可運作的 Web Scraper 方案。

## 功能特色

- ✅ 使用 Apify 官方免費 Web Scraper (`apify/web-scraper`)
- ✅ 支援多個查詢關鍵字順序執行
- ✅ 自動避免 rate limit（每次查詢間隔 2 秒）
- ✅ 可設定每個查詢的抓取數量限制
- ✅ 支援 Proxy 設定（RESIDENTIAL/其他）
- ✅ 結果可儲存為 JSON 或 CSV 格式
- ✅ 提供完整的 Pin 資料（圖片、互動數據、發布者資訊等）
- ✅ REST API 端點供前端或其他服務呼叫

## 架構

```
lib/
  pinterest-scraper.ts       # 核心爬蟲邏輯
app/api/admin/
  pinterest-scraper/
    route.ts                 # API 端點
data/
  pinterest/                 # 結果儲存目錄
    pinterest_search_*.json
    pinterest_search_*.csv
```

## 環境變數

在 `.env.local` 設定：

```bash
APIFY_TOKEN=apify_api_xxx...
```

## 使用方式

### 1. 透過 API 呼叫

**基本搜尋**

```bash
curl -X POST http://localhost:3000/api/admin/pinterest-scraper \
  -H "Content-Type: application/json" \
  -d '{
    "queries": ["packaging design", "gift box"],
    "limit": 50
  }'
```

**搜尋並儲存**

```bash
curl -X POST http://localhost:3000/api/admin/pinterest-scraper \
  -H "Content-Type: application/json" \
  -d '{
    "queries": ["sustainable packaging", "eco friendly bag"],
    "limit": 100,
    "saveToFile": true,
    "format": "both"
  }'
```

**使用自訂 Proxy**

```bash
curl -X POST http://localhost:3000/api/admin/pinterest-scraper \
  -H "Content-Type: application/json" \
  -d '{
    "queries": ["luxury packaging"],
    "limit": 200,
    "proxyConfiguration": {
      "useApifyProxy": true,
      "apifyProxyGroups": ["RESIDENTIAL"]
    }
  }'
```

### 2. 透過程式碼直接呼叫

```typescript
import { searchPinterest, savePinterestResultsToJSON } from "@/lib/pinterest-scraper";

// 執行搜尋
const results = await searchPinterest({
  queries: ["packaging", "gift bag", "eco packaging"],
  limit: 100,
  proxyConfiguration: {
    useApifyProxy: true,
    apifyProxyGroups: ["RESIDENTIAL"]
  }
});

// 儲存結果
const filePath = await savePinterestResultsToJSON(results);
console.log(`結果已儲存到: ${filePath}`);
```

## API 規格

### POST /api/admin/pinterest-scraper

**Request Body**

| 欄位 | 類型 | 必填 | 預設值 | 說明 |
|------|------|------|--------|------|
| queries | string[] | ✅ | - | 查詢關鍵字陣列 |
| limit | number | ❌ | 100 | 每個查詢最多抓取數量 |
| saveToFile | boolean | ❌ | false | 是否儲存結果到檔案 |
| format | string | ❌ | "json" | 儲存格式：`json`/`csv`/`both` |
| proxyConfiguration | object | ❌ | 見下方 | Proxy 設定 |

**預設 Proxy 設定**

```json
{
  "useApifyProxy": true,
  "apifyProxyGroups": ["RESIDENTIAL"]
}
```

**Response**

```json
{
  "success": true,
  "stats": {
    "totalQueries": 3,
    "totalPins": 250,
    "avgPinsPerQuery": 83,
    "totalRepins": 12500,
    "totalComments": 350,
    "totalReactions": 8900,
    "queriesBreakdown": [
      { "query": "packaging", "count": 100 },
      { "query": "gift bag", "count": 100 },
      { "query": "eco packaging", "count": 50 }
    ]
  },
  "results": [
    {
      "query": "packaging",
      "pins": [...],
      "totalCount": 100,
      "actorRunId": "abc123",
      "datasetId": "def456"
    }
  ],
  "savedFiles": {
    "json": "./data/pinterest/pinterest_search_2025-12-01T12-00-00.json",
    "csv": "./data/pinterest/pinterest_search_2025-12-01T12-00-00.csv"
  }
}
```

### GET /api/admin/pinterest-scraper

取得 API 使用說明（本文件內容的 JSON 格式）

## 資料結構

### PinterestPin

```typescript
interface PinterestPin {
  // 基本資訊
  id: string;                  // Pin ID
  title: string;               // Pin 標題
  description?: string;        // Pin 描述
  url: string;                 // Pin 連結
  
  // 圖片資訊
  imageUrl: string;            // 原始圖片 URL
  imageWidth?: number;         // 圖片寬度
  imageHeight?: number;        // 圖片高度
  
  // 互動數據
  repinCount?: number;         // 轉發數
  commentCount?: number;       // 評論數
  reactionCount?: number;      // 反應數
  
  // 發布者資訊
  pinner?: {
    id: string;
    username: string;
    fullName?: string;
    followerCount?: number;
  };
  
  // 版面資訊
  board?: {
    id: string;
    name: string;
    url?: string;
  };
  
  // 時間戳記
  createdAt?: string;          // Pin 建立時間
  scrapedAt: string;           // 抓取時間
  
  // 查詢來源
  sourceQuery: string;         // 來源查詢關鍵字
}
```

## 使用範例

### 範例 1：設計靈感池搜尋

```typescript
// 搜尋多個包裝相關關鍵字
const results = await searchPinterest({
  queries: [
    "packaging design",
    "gift box design",
    "sustainable packaging",
    "luxury packaging",
    "eco friendly bag"
  ],
  limit: 100, // 每個關鍵字抓 100 筆
});

// 儲存為 JSON（供素材庫使用）
await savePinterestResultsToJSON(results, "./data/design-inspiration");
```

### 範例 2：特定主題深度搜尋

```typescript
// 深度搜尋特定主題
const results = await searchPinterest({
  queries: ["minimalist packaging"],
  limit: 500, // 深度搜尋 500 筆
  proxyConfiguration: {
    useApifyProxy: true,
    apifyProxyGroups: ["RESIDENTIAL"] // 使用住宅 IP，提高成功率
  }
});

// 儲存為 CSV（供 Excel 分析）
await savePinterestResultsToCSV(results);
```

### 範例 3：批次搜尋並分析

```typescript
import { searchPinterest, getPinterestStats } from "@/lib/pinterest-scraper";

// 批次搜尋
const results = await searchPinterest({
  queries: ["packaging", "bag", "gift bag"],
  limit: 200
});

// 取得統計資訊
const stats = getPinterestStats(results);

console.log(`共搜尋 ${stats.totalQueries} 個關鍵字`);
console.log(`總共抓取 ${stats.totalPins} 個 Pins`);
console.log(`平均每個關鍵字 ${stats.avgPinsPerQuery} 個 Pins`);
console.log(`總轉發數: ${stats.totalRepins}`);
console.log(`總評論數: ${stats.totalComments}`);
```

## 注意事項

### 1. Rate Limit

- 查詢會順序執行，每次間隔 2 秒
- 避免同時執行多個搜尋任務
- 建議分批執行大量查詢

### 2. 配額管理

- 每個查詢的 `limit` 建議設定為 100-500
- 使用 RESIDENTIAL proxy 會消耗較多配額
- 監控 Apify 使用量，避免超出配額

### 3. Proxy 設定

**RESIDENTIAL (推薦)**
- 成功率最高
- 適合重要搜尋
- 配額消耗較多

**BUYPROXIES**
- 成本較低
- 適合測試或大量搜尋
- 可能遇到封鎖

**不使用 Proxy**
```typescript
proxyConfiguration: {
  useApifyProxy: false
}
```

### 4. 結果儲存

**JSON 格式**
- 保留完整資料結構
- 適合程式處理
- 檔案較大

**CSV 格式**
- 適合 Excel 分析
- 使用 UTF-8 BOM 編碼
- 自動處理逗號、引號等特殊字元

## 錯誤處理

```typescript
try {
  const results = await searchPinterest({
    queries: ["test"],
    limit: 100
  });
} catch (error) {
  if (error.message.includes("APIFY_TOKEN")) {
    console.error("請設定 APIFY_TOKEN 環境變數");
  } else if (error.message.includes("rate limit")) {
    console.error("超過 API rate limit，請稍後再試");
  } else {
    console.error("搜尋失敗:", error);
  }
}
```

## 整合到現有系統

### 整合到 Gift Box Radar

```typescript
// app/admin/gift-box-radar/page.tsx

import { searchPinterest } from "@/lib/pinterest-scraper";

async function handlePinterestSearch(keywords: string[]) {
  // 使用新的 Pinterest Scraper
  const results = await searchPinterest({
    queries: keywords,
    limit: 100,
  });
  
  // 轉換為 TrendAsset 格式
  const assets = results.flatMap(r => 
    r.pins.map(pin => ({
      id: pin.id,
      title: pin.title,
      imageUrl: pin.imageUrl,
      url: pin.url,
      platform: "pinterest" as const,
      keyword: r.query,
      popularityScore: calculateScore(pin),
      capturedAt: pin.scrapedAt,
    }))
  );
  
  return assets;
}
```

### 整合到素材庫系統

```typescript
// lib/asset-library.ts

import { searchPinterest } from "@/lib/pinterest-scraper";
import { prisma } from "@/lib/prisma";

async function importPinterestAssets(queries: string[]) {
  // 搜尋 Pinterest
  const results = await searchPinterest({
    queries,
    limit: 200,
  });
  
  // 儲存到資料庫
  for (const result of results) {
    for (const pin of result.pins) {
      await prisma.asset.create({
        data: {
          externalId: pin.id,
          title: pin.title,
          description: pin.description,
          imageUrl: pin.imageUrl,
          sourceUrl: pin.url,
          platform: "pinterest",
          tags: [result.query],
          metadata: {
            repinCount: pin.repinCount,
            commentCount: pin.commentCount,
            pinner: pin.pinner,
          }
        }
      });
    }
  }
}
```

## 測試

```bash
# 測試 API 端點
curl http://localhost:3000/api/admin/pinterest-scraper

# 執行搜尋測試
curl -X POST http://localhost:3000/api/admin/pinterest-scraper \
  -H "Content-Type: application/json" \
  -d '{"queries": ["test"], "limit": 10}'
```

## 未來改進

- [ ] 支援 Prisma 資料庫直接儲存
- [ ] 支援圖片下載到 R2/S3
- [ ] 支援增量更新（避免重複抓取）
- [ ] 支援搜尋結果去重
- [ ] 支援更多 Actor 參數設定
- [ ] 支援 webhook 通知完成
- [ ] 支援批次搜尋排程

## 授權與聲明

本整合使用 Apify 官方 Pinterest Scraper Actor，請遵守 Apify 使用條款與 Pinterest 使用政策。

---

**文件版本**: 1.0.0  
**最後更新**: 2025-12-01  
**維護者**: MB Team
