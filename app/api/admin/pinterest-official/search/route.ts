// app/api/admin/pinterest-official/search/route.ts
// Pinterest Official API 搜尋端點

import { NextRequest, NextResponse } from "next/server";
import {
  searchPinterestOfficialBatch,
  savePinterestOfficialResults,
  type PinterestApiConfig,
} from "@/lib/pinterest-api-official";

/**
 * POST /api/admin/pinterest-official/search
 * 使用 Pinterest Official API 搜尋
 * 
 * Request Body:
 * {
 *   "queries": ["包裝盒", "gift box"],
 *   "limit": 25,  // 每個查詢的結果數量 (預設 25，最大 250)
 *   "saveToFile": true
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { queries, limit, saveToFile } = body;

    // 驗證輸入
    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      return NextResponse.json(
        { error: "請提供至少一個查詢關鍵字（queries 陣列）" },
        { status: 400 }
      );
    }

    const config: PinterestApiConfig = {
      queries,
      limit: limit || 25,
    };

    console.log(`[API] Pinterest Official API 搜尋請求:`, config);

    // 執行搜尋
    const results = await searchPinterestOfficialBatch(config);

    // 轉換為統一格式
    const formattedResults: any[] = [];
    let totalPins = 0;

    for (const [query, result] of results.entries()) {
      const pins = result.items.map((pin) => ({
        id: pin.id,
        title: pin.title || pin.alt_text || "",
        description: pin.description || "",
        url: pin.link || `https://www.pinterest.com/pin/${pin.id}/`,
        imageUrl: pin.media?.images?.["736x"]?.url || pin.media?.images?.["originals"]?.url || "",
        createdAt: pin.created_at,
        boardId: pin.board_id,
        sourceQuery: query,
      }));

      formattedResults.push({
        query,
        pins,
        totalCount: pins.length,
        hasMore: !!result.bookmark,
      });

      totalPins += pins.length;
    }

    // 儲存到檔案（選填）
    let savedFilePath: string | undefined;
    if (saveToFile) {
      savedFilePath = await savePinterestOfficialResults(results);
    }

    return NextResponse.json({
      success: true,
      results: formattedResults,
      stats: {
        totalQueries: queries.length,
        totalPins,
        averagePerQuery: Math.round(totalPins / queries.length),
      },
      savedFile: savedFilePath,
    });
  } catch (error: any) {
    console.error(`[API] Pinterest Official API 搜尋失敗:`, error);

    // 處理常見錯誤
    if (error.message.includes("PINTEREST_ACCESS_TOKEN")) {
      return NextResponse.json(
        {
          error: "Pinterest Access Token 未設定",
          instructions: {
            step1: "前往 https://developers.pinterest.com/",
            step2: "建立應用程式並取得 Access Token",
            step3: "在 .env.local 設定 PINTEREST_ACCESS_TOKEN=your_token",
            step4: "重新啟動開發伺服器",
          },
        },
        { status: 400 }
      );
    }

    if (error.message.includes("401")) {
      return NextResponse.json(
        {
          error: "Pinterest API 認證失敗",
          message: "Access Token 可能已過期或無效",
          solution: "請重新取得 Access Token 並更新 .env.local",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "搜尋失敗",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/pinterest-official/search
 * API 文檔
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    endpoint: "/api/admin/pinterest-official/search",
    method: "POST",
    description: "使用 Pinterest Official API v5 搜尋 Pins",
    authentication: "需要 PINTEREST_ACCESS_TOKEN 環境變數",
    requestBody: {
      queries: {
        type: "string[]",
        required: true,
        description: "搜尋關鍵字陣列",
        example: ["包裝盒", "gift box", "eco packaging"],
      },
      limit: {
        type: "number",
        required: false,
        default: 25,
        max: 250,
        description: "每個查詢的結果數量",
      },
      saveToFile: {
        type: "boolean",
        required: false,
        default: false,
        description: "是否儲存結果到 data/pinterest/",
      },
    },
    responseExample: {
      success: true,
      results: [
        {
          query: "gift box",
          pins: [
            {
              id: "123456789",
              title: "Beautiful Gift Box",
              description: "...",
              url: "https://www.pinterest.com/pin/123456789/",
              imageUrl: "https://...",
              createdAt: "2024-01-01T00:00:00Z",
            },
          ],
          totalCount: 25,
          hasMore: true,
        },
      ],
      stats: {
        totalQueries: 3,
        totalPins: 75,
        averagePerQuery: 25,
      },
    },
    setup: {
      step1: "前往 https://developers.pinterest.com/",
      step2: "建立應用程式",
      step3: "取得 Access Token",
      step4: "在 .env.local 設定 PINTEREST_ACCESS_TOKEN=your_token",
      step5: "重新啟動開發伺服器",
      testEndpoint: "/api/admin/pinterest-official/test",
    },
    rateLimit: {
      note: "Pinterest API 有 rate limit",
      recommendation: "每次搜尋間隔 1 秒",
      limits: "請參考 https://developers.pinterest.com/docs/api/v5/#tag/Rate-limits",
    },
  });
}
