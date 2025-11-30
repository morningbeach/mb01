// lib/pinterest-scraper.ts
// Pinterest Search Scraper 整合 - 使用 Apify 官方 Pinterest Scraper Actor
// 支援多查詢詞順序執行，並將結果存儲到資料庫

import { ApifyClient } from "apify-client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// ===== 介面定義 =====

export interface PinterestSearchConfig {
  queries: string[];                    // 查詢關鍵字陣列
  limit?: number;                       // 每個查詢最多抓取數量 (預設 100)
  proxyConfiguration?: {                // Proxy 設定 (選填)
    useApifyProxy?: boolean;
    apifyProxyGroups?: string[];
  };
  maxResults?: number;                  // Actor 設定：最多抓取結果數
  maxRequestRetries?: number;           // Actor 設定：最大重試次數
}

export interface PinterestPin {
  // 基本資訊
  id: string;                           // Pin ID
  title: string;                        // Pin 標題
  description?: string;                 // Pin 描述
  url: string;                          // Pin 連結
  
  // 圖片資訊
  imageUrl: string;                     // 原始圖片 URL
  imageWidth?: number;                  // 圖片寬度
  imageHeight?: number;                 // 圖片高度
  
  // 互動數據
  repinCount?: number;                  // 轉發數
  commentCount?: number;                // 評論數
  reactionCount?: number;               // 反應數
  
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
  createdAt?: string;                   // Pin 建立時間
  scrapedAt: string;                    // 抓取時間
  
  // 查詢來源
  sourceQuery: string;                  // 來源查詢關鍵字
}

export interface PinterestSearchResult {
  query: string;                        // 查詢關鍵字
  pins: PinterestPin[];                 // Pin 列表
  totalCount: number;                   // 總數
  actorRunId?: string;                  // Apify Actor Run ID
  datasetId?: string;                   // Apify Dataset ID
}

// ===== Apify Client =====

function getApifyClient(): ApifyClient {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error("APIFY_TOKEN 未設定。請在 .env.local 設定 APIFY_TOKEN");
  }
  return new ApifyClient({ token });
}

// ===== 核心函數：執行 Pinterest Search Scraper =====

/**
 * 對單一查詢執行 Pinterest Search（使用 danielmilevski9/pinterest-crawler）
 * 這個 Actor 已經在您的帳戶中成功使用過
 */
async function runPinterestSearch(
  client: ApifyClient,
  query: string,
  config: PinterestSearchConfig
): Promise<PinterestSearchResult> {
  const actorId = "danielmilevski9/pinterest-crawler";
  
  console.log(`[Pinterest Scraper] 開始搜尋: "${query}"`);
  
  try {
    const targetLimit = config.limit || 100;

    // 建立 Pinterest Crawler 輸入設定（使用標準格式）
    const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
    const input = {
      startUrls: [{ url: searchUrl }],
      maxItems: targetLimit,
      proxyConfig: config.proxyConfiguration || {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      },
    };

    console.log(`[Pinterest Scraper] Actor 輸入:`, JSON.stringify(input, null, 2));

    // 執行 Actor
    const run = await client.actor(actorId).call(input, {
      waitSecs: 300,
      memory: 4096,
    });

    console.log(`[Pinterest Scraper] Actor 完成: ${run.id}`);
    console.log(`[Pinterest Scraper] Dataset ID: ${run.defaultDatasetId}`);

    // 取得結果
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    console.log(`[Pinterest Scraper] 共抓取 ${items.length} 筆資料`);

    // 轉換資料格式
    const pins: PinterestPin[] = items.map((item: any) => ({
      id: item.id || item.pinId || item.pin_id || `pin_${Date.now()}_${Math.random()}`,
      title: item.title || item.text || item.description || "",
      description: item.description || item.richDescription || "",
      url: item.url || item.link || item.pinUrl || `https://www.pinterest.com/pin/${item.id}/`,
      
      imageUrl: item.imageUrl || item.image || item.images?.orig?.url || item.media?.image?.url || "",
      imageWidth: item.imageWidth || item.images?.orig?.width,
      imageHeight: item.imageHeight || item.images?.orig?.height,
      
      repinCount: item.repinCount || item.repin_count || item.saves || 0,
      commentCount: item.commentCount || item.comment_count || item.comments || 0,
      reactionCount: item.reactionCount || item.reaction_count || 0,
      
      pinner: item.pinner ? {
        id: item.pinner.id || item.pinner.userId || "",
        username: item.pinner.username || item.pinner.user_name || "",
        fullName: item.pinner.fullName || item.pinner.full_name || item.pinner.name,
        followerCount: item.pinner.followerCount || item.pinner.follower_count,
      } : undefined,
      
      board: item.board ? {
        id: item.board.id || item.board.boardId || "",
        name: item.board.name || item.board.title || "",
        url: item.board.url,
      } : undefined,
      
      createdAt: item.createdAt || item.created_at || item.publishedAt,
      scrapedAt: new Date().toISOString(),
      sourceQuery: query,
    }));

    // 套用 limit 限制並去重
    const uniquePins = Array.from(new Map(pins.map(p => [p.id, p])).values());
    const limitedPins = uniquePins.slice(0, config.limit || 100);

    return {
      query,
      pins: limitedPins,
      totalCount: limitedPins.length,
      actorRunId: run.id,
      datasetId: run.defaultDatasetId,
    };

  } catch (error: any) {
    console.error(`[Pinterest Scraper] 搜尋失敗: "${query}"`, error);
    return {
      query,
      pins: [],
      totalCount: 0,
    };
  }
}

/**
 * 對多個查詢順序執行 Pinterest Search Scraper
 */
export async function searchPinterest(
  config: PinterestSearchConfig
): Promise<PinterestSearchResult[]> {
  const client = getApifyClient();
  const results: PinterestSearchResult[] = [];

  console.log(`[Pinterest Scraper] 開始批次搜尋，共 ${config.queries.length} 個查詢`);

  // 順序執行每個查詢（避免 rate limit）
  for (const query of config.queries) {
    const result = await runPinterestSearch(client, query, config);
    results.push(result);
    
    // 每次查詢後暫停 2 秒
    if (config.queries.indexOf(query) < config.queries.length - 1) {
      console.log(`[Pinterest Scraper] 暫停 2 秒...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`[Pinterest Scraper] 批次搜尋完成，共取得 ${results.reduce((sum, r) => sum + r.totalCount, 0)} 筆資料`);

  return results;
}

// ===== 資料儲存功能 =====

/**
 * 將結果儲存為 JSON 檔案
 */
export async function savePinterestResultsToJSON(
  results: PinterestSearchResult[],
  outputDir: string = "./data/pinterest"
): Promise<string> {
  try {
    // 確保目錄存在
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    // 產生檔案名稱（包含時間戳記）
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `pinterest_search_${timestamp}.json`;
    const filePath = join(outputDir, fileName);

    // 準備輸出資料
    const output = {
      metadata: {
        totalQueries: results.length,
        totalPins: results.reduce((sum, r) => sum + r.totalCount, 0),
        scrapedAt: new Date().toISOString(),
      },
      results,
    };

    // 寫入檔案
    await writeFile(filePath, JSON.stringify(output, null, 2), "utf-8");

    console.log(`[Pinterest Scraper] 結果已儲存到: ${filePath}`);

    return filePath;

  } catch (error: any) {
    console.error(`[Pinterest Scraper] 儲存 JSON 失敗:`, error);
    throw error;
  }
}

/**
 * 將結果儲存為 CSV 檔案
 */
export async function savePinterestResultsToCSV(
  results: PinterestSearchResult[],
  outputDir: string = "./data/pinterest"
): Promise<string> {
  try {
    // 確保目錄存在
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    // 產生檔案名稱
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `pinterest_search_${timestamp}.csv`;
    const filePath = join(outputDir, fileName);

    // 收集所有 pins
    const allPins = results.flatMap(r => r.pins);

    // CSV 標題
    const headers = [
      "Query",
      "Pin ID",
      "Title",
      "Description",
      "URL",
      "Image URL",
      "Image Width",
      "Image Height",
      "Repin Count",
      "Comment Count",
      "Reaction Count",
      "Pinner Username",
      "Pinner Full Name",
      "Board Name",
      "Created At",
      "Scraped At"
    ];

    // CSV 行
    const rows = allPins.map(pin => [
      pin.sourceQuery,
      pin.id,
      `"${(pin.title || "").replace(/"/g, '""')}"`,
      `"${(pin.description || "").replace(/"/g, '""')}"`,
      pin.url,
      pin.imageUrl,
      pin.imageWidth || "",
      pin.imageHeight || "",
      pin.repinCount || 0,
      pin.commentCount || 0,
      pin.reactionCount || 0,
      pin.pinner?.username || "",
      `"${(pin.pinner?.fullName || "").replace(/"/g, '""')}"`,
      `"${(pin.board?.name || "").replace(/"/g, '""')}"`,
      pin.createdAt || "",
      pin.scrapedAt
    ]);

    // 組合 CSV 內容
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // 寫入檔案（加入 BOM 以支援 Excel 開啟 UTF-8）
    await writeFile(filePath, "\uFEFF" + csvContent, "utf-8");

    console.log(`[Pinterest Scraper] 結果已儲存到: ${filePath}`);

    return filePath;

  } catch (error: any) {
    console.error(`[Pinterest Scraper] 儲存 CSV 失敗:`, error);
    throw error;
  }
}

// ===== 輔助函數 =====

/**
 * 取得所有 Pin 的統計資訊
 */
export function getPinterestStats(results: PinterestSearchResult[]) {
  const allPins = results.flatMap(r => r.pins);
  
  return {
    totalQueries: results.length,
    totalPins: allPins.length,
    avgPinsPerQuery: Math.round(allPins.length / results.length),
    totalRepins: allPins.reduce((sum, p) => sum + (p.repinCount || 0), 0),
    totalComments: allPins.reduce((sum, p) => sum + (p.commentCount || 0), 0),
    totalReactions: allPins.reduce((sum, p) => sum + (p.reactionCount || 0), 0),
    queriesBreakdown: results.map(r => ({
      query: r.query,
      count: r.totalCount,
    })),
  };
}
