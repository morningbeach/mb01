// app/api/admin/gift-box-radar/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { searchGiftBoxTrends, type TrendAsset, type TrendPlatform } from "@/lib/apify-adapters";

interface SearchRequest {
  sources: TrendPlatform[];
  keywords: string[];
  region?: string;
  limit: number;
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

// 簡單的 rate limit（每 IP 每 10 分鐘最多 5 次）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(ip);

  if (!limit) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 10 * 60 * 1000 });
    return true;
  }

  if (now > limit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 10 * 60 * 1000 });
    return true;
  }

  if (limit.count >= 5) {
    return false;
  }

  limit.count++;
  return true;
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
  console.log("[Gift Box Radar] API route called");
  
  try {
    // 驗證管理員身份
    const isAdmin = await validateAdminAccess();
    if (!isAdmin) {
      console.log("[Gift Box Radar] Unauthorized access attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 檢查 rate limit
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      console.log(`[Gift Box Radar] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // 解析請求
    const body = await req.json();
    console.log("[Gift Box Radar] Request body:", JSON.stringify(body, null, 2));
    
    const validation = validateInput(body);
    if (!validation.valid) {
      console.log(`[Gift Box Radar] Invalid input: ${validation.error}`);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { sources, keywords, region, limit } = body as SearchRequest;

    // 檢查 APIFY_TOKEN
    if (!process.env.APIFY_TOKEN) {
      console.error("[Gift Box Radar] APIFY_TOKEN not configured");
      return NextResponse.json(
        { error: "Server configuration error: APIFY_TOKEN missing" },
        { status: 500 }
      );
    }

    // 執行搜尋
    console.log(`[Gift Box Radar] Starting search: sources=${sources.join(",")}, keywords=${keywords.join(",")}`);
    
    const results = await searchGiftBoxTrends({
      sources,
      keywords,
      region: region || "US",
      limit,
    });

    console.log(`[Gift Box Radar] Search completed: ${results.length} results found`);

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error("[Gift Box Radar] Search error:", error);
    console.error("[Gift Box Radar] Error stack:", error.stack);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
