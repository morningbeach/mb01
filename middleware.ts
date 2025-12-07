// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

// Note: middleware runs in the Edge runtime — avoid heavy Node APIs here.

// 不需要驗證的路徑（登入頁、API 路由等）
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/session/validate",
  "/api/admin/test-session",
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const response = NextResponse.next();

  // ========================================
  // 地區偵測：台灣境內顯示中文，境外強制英文
  // ========================================
  // Vercel Edge Runtime 會提供 req.geo 物件
  // 也可以透過 header 取得（備用）
  const country = 
    req.geo?.country ||
    req.headers.get("x-vercel-ip-country") || 
    req.headers.get("cf-ipcountry") || 
    "";
  
  // 台灣 = TW，其他地區或無法偵測 = 視為境外
  // 只有明確偵測到 TW 才視為台灣，其他一律視為境外（包括本地開發）
  const isTaiwan = country.toUpperCase() === "TW";
  
  // 設定地區 cookie（供前端讀取）
  // 所有路徑都設定，確保前端能讀取
  response.cookies.set("geo-region", isTaiwan ? "TW" : "INTL", {
    httpOnly: false, // 前端需要讀取
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 小時
    path: "/", // 確保所有路徑都能存取
  });

  // 1. 檢查是否為公開路徑（不需要驗證）
  if (PUBLIC_ADMIN_PATHS.some((p) => path === p || path.startsWith(p + "/"))) {
    return response;
  }

  // 2. 只保護 /admin 和 /api/admin 開頭的路由
  const isAdminPage = path.startsWith("/admin");
  const isAdminApi = path.startsWith("/api/admin");
  
  if (!isAdminPage && !isAdminApi) {
    return response;
  }

  // 3. 只在 production 或設定 ADMIN_PROTECT=1 時強制驗證
  const enforce =
    process.env.NODE_ENV === "production" ||
    process.env.ADMIN_PROTECT === "1";
  if (!enforce) {
    return response;
  }

  // 4. 驗證 session cookie
  const cookie = req.headers.get("cookie") || "";
  try {
    const validateUrl = new URL("/api/admin/session/validate", req.url);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超時
    
    const res = await fetch(validateUrl.toString(), {
      method: "GET",
      headers: { cookie },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.valid) {
        return response;
      }
    }
  } catch (e: any) {
    // 如果驗證失敗（網路錯誤、超時等），對於非 admin 頁面，允許繼續
    console.error("Session validate fetch error:", e?.message || e);
    // 如果是超時或網路錯誤，暫時允許訪問（避免整站崩潰）
    if (e?.name === 'AbortError' || e?.message?.includes('fetch')) {
      console.warn("Session validation timeout/error - allowing access temporarily");
      return response;
    }
  }

  // 5. 驗證失敗
  // - API 路由：返回 401 JSON
  // - 頁面：重導向到登入頁
  if (isAdminApi) {
    return NextResponse.json(
      { success: false, message: "Unauthorized - Please login" },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // 匹配所有路徑（用於地區偵測），排除靜態資源
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
