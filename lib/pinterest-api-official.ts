// lib/pinterest-api-official.ts
// Pinterest Official API v5 Integration
// 需要 Pinterest Developer Account 和 Access Token
// 文檔: https://developers.pinterest.com/docs/api/v5/

/**
 * Pinterest Pin 資料結構（官方 API）
 */
export interface PinterestApiPin {
  id: string;
  created_at: string;
  link?: string;
  title?: string;
  description?: string;
  dominant_color?: string;
  alt_text?: string;
  board_id?: string;
  board_section_id?: string;
  media: {
    media_type: string;
    images?: {
      [key: string]: {
        url: string;
        width: number;
        height: number;
      };
    };
  };
}

export interface PinterestApiSearchResult {
  items: PinterestApiPin[];
  bookmark?: string; // 用於分頁
}

export interface PinterestApiConfig {
  queries: string[];
  limit?: number;
  accessToken?: string;
}

/**
 * 取得 Pinterest Access Token
 */
function getPinterestAccessToken(): string {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "PINTEREST_ACCESS_TOKEN 未設定\n" +
      "請至 https://developers.pinterest.com/ 申請開發者帳號並取得 Access Token\n" +
      "然後在 .env.local 設定: PINTEREST_ACCESS_TOKEN=your_token_here"
    );
  }
  return token;
}

/**
 * 使用 Pinterest 官方 API 搜尋 Pins
 */
export async function searchPinterestOfficial(
  query: string,
  limit: number = 25,
  accessToken?: string
): Promise<PinterestApiSearchResult> {
  const token = accessToken || getPinterestAccessToken();
  
  // Pinterest API v5 Search endpoint
  const url = new URL("https://api.pinterest.com/v5/search/pins");
  url.searchParams.append("query", query);
  url.searchParams.append("page_size", Math.min(limit, 250).toString());

  console.log(`[Pinterest Official API] 搜尋: "${query}"`);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Pinterest API 錯誤 (${response.status}): ${errorText}\n` +
        `如果是 401 錯誤，請檢查 PINTEREST_ACCESS_TOKEN 是否有效`
      );
    }

    const data: PinterestApiSearchResult = await response.json();
    console.log(`[Pinterest Official API] 找到 ${data.items?.length || 0} 個結果`);

    return data;
  } catch (error: any) {
    console.error(`[Pinterest Official API] 搜尋失敗:`, error.message);
    throw error;
  }
}

/**
 * 批次搜尋多個關鍵字
 */
export async function searchPinterestOfficialBatch(
  config: PinterestApiConfig
): Promise<Map<string, PinterestApiSearchResult>> {
  const results = new Map<string, PinterestApiSearchResult>();
  const limit = config.limit || 25;

  console.log(`[Pinterest Official API] 開始批次搜尋，共 ${config.queries.length} 個查詢`);

  for (const query of config.queries) {
    try {
      const result = await searchPinterestOfficial(query, limit, config.accessToken);
      results.set(query, result);

      // 避免 rate limit，每次查詢間隔 1 秒
      if (config.queries.indexOf(query) < config.queries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      console.error(`[Pinterest Official API] 查詢 "${query}" 失敗:`, error.message);
      results.set(query, { items: [] });
    }
  }

  console.log(`[Pinterest Official API] 批次搜尋完成`);
  return results;
}

/**
 * 轉換為統一格式（與 Apify 版本相容）
 */
export function convertToStandardFormat(apiPin: PinterestApiPin) {
  // 取得最高品質的圖片
  let imageUrl = "";
  let imageWidth = 0;
  let imageHeight = 0;

  if (apiPin.media?.images) {
    // 優先順序: originals > 1200x > 736x > 564x > 474x > 236x
    const sizes = ["originals", "1200x", "736x", "564x", "474x", "236x"];
    for (const size of sizes) {
      if (apiPin.media.images[size]) {
        const img = apiPin.media.images[size];
        imageUrl = img.url;
        imageWidth = img.width;
        imageHeight = img.height;
        break;
      }
    }
  }

  return {
    id: apiPin.id,
    title: apiPin.title || apiPin.alt_text || "",
    description: apiPin.description || "",
    url: apiPin.link || `https://www.pinterest.com/pin/${apiPin.id}/`,
    imageUrl,
    imageWidth,
    imageHeight,
    dominantColor: apiPin.dominant_color,
    boardId: apiPin.board_id,
    createdAt: apiPin.created_at,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * 儲存結果到 JSON
 */
export async function savePinterestOfficialResults(
  results: Map<string, PinterestApiSearchResult>,
  outputDir: string = "./data/pinterest"
): Promise<string> {
  const fs = require("fs").promises;
  const path = require("path");

  // 確保目錄存在
  await fs.mkdir(outputDir, { recursive: true });

  // 轉換為標準格式
  const standardResults: any = {};
  for (const [query, result] of results.entries()) {
    standardResults[query] = {
      query,
      pins: result.items.map(convertToStandardFormat),
      totalCount: result.items.length,
      hasMore: !!result.bookmark,
    };
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `pinterest_official_${timestamp}.json`;
  const filepath = path.join(outputDir, filename);

  await fs.writeFile(filepath, JSON.stringify(standardResults, null, 2), "utf-8");
  console.log(`[Pinterest Official API] 結果已儲存: ${filepath}`);

  return filepath;
}

/**
 * 測試 Pinterest API 連線
 */
export async function testPinterestApiConnection(
  accessToken?: string
): Promise<{ success: boolean; message: string; userInfo?: any }> {
  try {
    const token = accessToken || getPinterestAccessToken();
    
    // 測試 API：取得用戶資訊
    const response = await fetch("https://api.pinterest.com/v5/user_account", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `API 連線失敗 (${response.status}): ${errorText}`,
      };
    }

    const userInfo = await response.json();
    return {
      success: true,
      message: "Pinterest API 連線成功！",
      userInfo,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `連線錯誤: ${error.message}`,
    };
  }
}
