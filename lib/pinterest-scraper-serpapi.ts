// lib/pinterest-scraper-serpapi.ts
// Pinterest 搜尋工具 - 使用 SerpAPI
// 穩定可靠，已在 Gift Box Radar 驗證可用

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// ===== 類型定義 =====

export interface PinterestPin {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  url: string;
  keyword: string;
  position?: number;
  capturedAt: string;
}

export interface PinterestSearchConfig {
  queries: string[];
  limit?: number;
}

export interface PinterestSearchResult {
  query: string;
  pins: PinterestPin[];
  error?: string;
}

// ===== SerpAPI 搜尋 =====

async function searchPinterestWithSerpAPI(
  query: string,
  limit: number = 100
): Promise<PinterestPin[]> {
  console.log(`[Pinterest Scraper] 開始搜尋 (SerpAPI): "${query}"`);
  
  const serpApiKey = process.env.SERPAPI_KEY;
  if (!serpApiKey) {
    throw new Error("SERPAPI_KEY not configured in .env.local");
  }

  // 構建 Pinterest 站內搜尋
  const searchQuery = `site:pinterest.com ${query}`;
  const params = new URLSearchParams({
    engine: "google",
    q: searchQuery,
    api_key: serpApiKey,
    num: Math.min(limit, 100).toString(), // Google 最多返回 100 結果
    gl: "us",
    hl: "en",
    tbm: "isch", // 圖片搜尋模式
  });

  const url = `https://serpapi.com/search?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SerpAPI 錯誤: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.images_results) {
      console.log(`[Pinterest Scraper] 查詢 "${query}" 無結果`);
      return [];
    }

    const results = data.images_results
      .filter((item: any) => item.link && item.link.includes("pinterest"))
      .slice(0, limit)
      .map((item: any, index: number) => ({
        id: `pin-${Date.now()}-${index}`,
        title: item.title || "",
        description: item.snippet || "",
        imageUrl: item.thumbnail || item.original || "",
        url: item.link || "",
        keyword: query,
        position: item.position || index + 1,
        capturedAt: new Date().toISOString(),
      }));
    
    console.log(`[Pinterest Scraper] 查詢 "${query}" 取得 ${results.length} 個結果`);
    
    return results;
  } catch (error: any) {
    console.error(`[Pinterest Scraper] SerpAPI 搜尋失敗: "${query}"`, error.message);
    throw error;
  }
}

// ===== 批次搜尋 =====

export async function searchPinterest(
  config: PinterestSearchConfig
): Promise<PinterestSearchResult[]> {
  const { queries, limit = 100 } = config;

  console.log(`[Pinterest Scraper] 開始批次搜尋，共 ${queries.length} 個查詢`);

  const results: PinterestSearchResult[] = [];

  for (const query of queries) {
    try {
      const pins = await searchPinterestWithSerpAPI(query, limit);
      results.push({
        query,
        pins,
      });

      // 避免 API 限流，每次查詢間隔 1 秒
      if (queries.indexOf(query) < queries.length - 1) {
        console.log(`[Pinterest Scraper] 暫停 1 秒...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      console.error(`[Pinterest Scraper] 查詢失敗: "${query}"`, error);
      results.push({
        query,
        pins: [],
        error: error.message,
      });
    }
  }

  const totalPins = results.reduce((sum, r) => sum + r.pins.length, 0);
  console.log(`[Pinterest Scraper] 批次搜尋完成，共取得 ${totalPins} 筆資料`);

  return results;
}

// ===== 儲存為 JSON =====

export async function savePinterestResultsToJSON(
  results: PinterestSearchResult[],
  outputDir: string = "data/pinterest"
): Promise<string> {
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `pinterest_search_${timestamp}.json`;
  const filepath = join(outputDir, filename);

  await writeFile(filepath, JSON.stringify(results, null, 2), "utf-8");

  console.log(`[Pinterest Scraper] 結果已儲存到: ${filepath}`);

  return filepath;
}

// ===== 儲存為 CSV =====

export async function savePinterestResultsToCSV(
  results: PinterestSearchResult[],
  outputDir: string = "data/pinterest"
): Promise<string> {
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `pinterest_search_${timestamp}.csv`;
  const filepath = join(outputDir, filename);

  // CSV Header
  const header = [
    "Query",
    "Pin ID",
    "Title",
    "Description",
    "Image URL",
    "URL",
    "Position",
    "Captured At",
  ].join(",");

  // CSV Rows
  const rows: string[] = [];
  for (const result of results) {
    for (const pin of result.pins) {
      const row = [
        `"${result.query}"`,
        `"${pin.id}"`,
        `"${(pin.title || "").replace(/"/g, '""')}"`,
        `"${(pin.description || "").replace(/"/g, '""')}"`,
        `"${pin.imageUrl}"`,
        `"${pin.url}"`,
        pin.position || "",
        `"${pin.capturedAt}"`,
      ].join(",");
      rows.push(row);
    }
  }

  const csv = "\uFEFF" + [header, ...rows].join("\n"); // BOM for Excel UTF-8

  await writeFile(filepath, csv, "utf-8");

  console.log(`[Pinterest Scraper] 結果已儲存到: ${filepath}`);

  return filepath;
}

// ===== 統計資訊 =====

export function getPinterestStats(results: PinterestSearchResult[]): {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  totalPins: number;
  averagePinsPerQuery: number;
} {
  const totalQueries = results.length;
  const successfulQueries = results.filter((r) => !r.error).length;
  const failedQueries = results.filter((r) => r.error).length;
  const totalPins = results.reduce((sum, r) => sum + r.pins.length, 0);
  const averagePinsPerQuery =
    successfulQueries > 0 ? totalPins / successfulQueries : 0;

  return {
    totalQueries,
    successfulQueries,
    failedQueries,
    totalPins,
    averagePinsPerQuery: Math.round(averagePinsPerQuery * 100) / 100,
  };
}
