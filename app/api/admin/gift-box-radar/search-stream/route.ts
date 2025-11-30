// app/api/admin/gift-box-radar/search-stream/route.ts
// 使用 Server-Sent Events (SSE) 即時串流搜尋結果

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { searchGiftBoxTrendsStream, type TrendPlatform, type GoogleImageFilters } from "@/lib/apify-adapters";

interface SearchRequest {
  sources: TrendPlatform[];
  keywords: string[];
  region?: string;
  limit: number;
  googleFilters?: GoogleImageFilters;
}

// 驗證 Admin 身份
async function validateAdminAccess(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const sessionId = cookieStore.get("admin_session")?.value;
    
    if (!sessionId) {
      return false;
    }
    
    const session = await getSession(sessionId);
    return !!session?.userId;
  } catch {
    return false;
  }
}

// 驗證輸入
function validateInput(body: any): { valid: boolean; error?: string } {
  const { sources, keywords, limit } = body;

  if (!Array.isArray(sources) || sources.length === 0) {
    return { valid: false, error: "At least one source is required" };
  }

  const validSources: TrendPlatform[] = ["pinterest", "behance", "google", "amazon", "alibaba1688"];
  for (const source of sources) {
    if (!validSources.includes(source)) {
      return { valid: false, error: `Invalid source: ${source}` };
    }
  }

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return { valid: false, error: "At least one keyword is required" };
  }

  if (keywords.length > 5) {
    return { valid: false, error: "Maximum 5 keywords allowed" };
  }

  if (typeof limit !== "number" || limit < 1 || limit > 200) {
    return { valid: false, error: "Limit must be between 1 and 200" };
  }

  return { valid: true };
}

export async function POST(req: NextRequest) {
  console.log("[Gift Box Radar Stream] API route called");
  
  // 驗證管理員身份
  const isAdmin = await validateAdminAccess();
  if (!isAdmin) {
    console.log("[Gift Box Radar Stream] Unauthorized access attempt");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 解析請求
  let body: SearchRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("[Gift Box Radar Stream] Request body:", JSON.stringify(body, null, 2));
  
  const validation = validateInput(body);
  if (!validation.valid) {
    console.log(`[Gift Box Radar Stream] Invalid input: ${validation.error}`);
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { sources, keywords, region, limit, googleFilters } = body;

  // 檢查 APIFY_TOKEN
  if (!process.env.APIFY_TOKEN) {
    console.error("[Gift Box Radar Stream] APIFY_TOKEN not configured");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 創建 SSE 串流
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (eventType: string, data: any) => {
        const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      try {
        console.log(`[Gift Box Radar Stream] Starting search: sources=${sources.join(",")}, keywords=${keywords.join(",")}`);
        if (googleFilters) {
          console.log(`[Gift Box Radar Stream] Google filters:`, googleFilters);
        }
        
        sendEvent("status", { message: "開始搜尋...", sources, keywords });
        
        let totalCount = 0;
        
        // 使用串流版本的搜尋函數
        await searchGiftBoxTrendsStream(
          { sources, keywords, region: region || "US", limit, googleFilters },
          (platform: string, assets: any[]) => {
            // 每當有新資料就發送
            totalCount += assets.length;
            console.log(`[Gift Box Radar Stream] ${platform}: ${assets.length} items (total: ${totalCount})`);
            
            sendEvent("results", {
              platform,
              count: assets.length,
              totalCount,
              assets,
            });
          },
          (platform: string) => {
            // 平台開始搜尋
            sendEvent("platform_start", { platform });
          }
        );
        
        sendEvent("complete", { totalCount, message: "搜尋完成" });
        console.log(`[Gift Box Radar Stream] Search completed: ${totalCount} total results`);
        
      } catch (error: any) {
        console.error("[Gift Box Radar Stream] Error:", error);
        sendEvent("error", { message: error.message || "搜尋發生錯誤" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
