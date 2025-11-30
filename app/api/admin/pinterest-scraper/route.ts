// app/api/admin/pinterest-scraper/route.ts
// Pinterest Search Scraper API 端點
// 接受查詢關鍵字陣列，順序執行搜尋，並返回結果

import { NextRequest, NextResponse } from "next/server";
import { 
  searchPinterest, 
  savePinterestResultsToJSON,
  savePinterestResultsToCSV,
  getPinterestStats,
  type PinterestSearchConfig 
} from "@/lib/pinterest-scraper";

// POST /api/admin/pinterest-scraper
// 執行 Pinterest 搜尋
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 驗證輸入
    const { queries, limit, saveToFile, format } = body;
    
    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      return NextResponse.json(
        { error: "請提供至少一個查詢關鍵字（queries 陣列）" },
        { status: 400 }
      );
    }

    // 建立搜尋設定
    const config: PinterestSearchConfig = {
      queries,
      limit: limit || 100,
    };

    console.log(`[API] Pinterest 搜尋請求:`, config);

    // 執行搜尋
    const results = await searchPinterest(config);

    // 取得統計資訊
    const stats = getPinterestStats(results);

    // 儲存到檔案（選填）
    let savedFiles: { json?: string; csv?: string } = {};
    
    if (saveToFile) {
      if (!format || format === "json" || format === "both") {
        const jsonPath = await savePinterestResultsToJSON(results);
        savedFiles.json = jsonPath;
      }
      
      if (format === "csv" || format === "both") {
        const csvPath = await savePinterestResultsToCSV(results);
        savedFiles.csv = csvPath;
      }
    }

    // 返回結果
    return NextResponse.json({
      success: true,
      stats,
      results,
      savedFiles: Object.keys(savedFiles).length > 0 ? savedFiles : undefined,
    });

  } catch (error: any) {
    console.error("[API] Pinterest 搜尋失敗:", error);
    return NextResponse.json(
      { error: error.message || "搜尋失敗" },
      { status: 500 }
    );
  }
}

// GET /api/admin/pinterest-scraper
// 取得 API 使用說明
export async function GET() {
  return NextResponse.json({
    name: "Pinterest Search Scraper API",
    version: "1.0.0",
    description: "使用 Apify Pinterest Scraper Actor 搜尋 Pinterest 內容",
    
    endpoints: {
      POST: {
        description: "執行 Pinterest 搜尋",
        url: "/api/admin/pinterest-scraper",
        method: "POST",
        
        requestBody: {
          queries: {
            type: "string[]",
            required: true,
            description: "查詢關鍵字陣列",
            example: ["packaging", "gift bag", "eco packaging"]
          },
          limit: {
            type: "number",
            required: false,
            default: 100,
            description: "每個查詢最多抓取數量（建議 100-500）"
          },
          saveToFile: {
            type: "boolean",
            required: false,
            default: false,
            description: "是否儲存結果到檔案"
          },
          format: {
            type: "string",
            required: false,
            default: "json",
            options: ["json", "csv", "both"],
            description: "儲存格式"
          },
          proxyConfiguration: {
            type: "object",
            required: false,
            description: "Proxy 設定",
            example: {
              useApifyProxy: true,
              apifyProxyGroups: ["RESIDENTIAL"]
            }
          }
        },
        
        responseBody: {
          success: "boolean",
          stats: {
            totalQueries: "number",
            totalPins: "number",
            avgPinsPerQuery: "number",
            totalRepins: "number",
            totalComments: "number",
            totalReactions: "number",
            queriesBreakdown: "array"
          },
          results: "PinterestSearchResult[]",
          savedFiles: {
            json: "string (optional)",
            csv: "string (optional)"
          }
        }
      }
    },
    
    examples: [
      {
        name: "基本搜尋",
        request: {
          method: "POST",
          url: "/api/admin/pinterest-scraper",
          body: {
            queries: ["packaging design", "gift box"],
            limit: 50
          }
        }
      },
      {
        name: "搜尋並儲存",
        request: {
          method: "POST",
          url: "/api/admin/pinterest-scraper",
          body: {
            queries: ["sustainable packaging", "eco friendly bag"],
            limit: 100,
            saveToFile: true,
            format: "both"
          }
        }
      },
      {
        name: "使用自訂 Proxy",
        request: {
          method: "POST",
          url: "/api/admin/pinterest-scraper",
          body: {
            queries: ["luxury packaging"],
            limit: 200,
            proxyConfiguration: {
              useApifyProxy: true,
              apifyProxyGroups: ["RESIDENTIAL", "BUYPROXIES94952"]
            }
          }
        }
      }
    ],
    
    environment: {
      required: ["APIFY_TOKEN"],
      description: "請在 .env.local 設定 APIFY_TOKEN"
    },
    
    notes: [
      "查詢會順序執行，每次查詢間隔 2 秒，避免 rate limit",
      "建議每個查詢 limit 設定為 100-500，避免過度消耗配額",
      "使用 RESIDENTIAL proxy 可提高成功率，但會消耗較多配額",
      "結果會自動儲存到 ./data/pinterest/ 目錄（如果 saveToFile=true）",
      "CSV 檔案使用 UTF-8 BOM 編碼，可直接用 Excel 開啟"
    ]
  });
}
