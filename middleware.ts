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

  // 3. 驗證 session cookie（用於角色權限檢查）
  const cookie = req.headers.get("cookie") || "";
  let userRole: string | null = null;
  let isValidSession = false;
  
  try {
    // 使用絕對 URL 確保在 Edge Runtime 中正確呼叫
    const origin = req.nextUrl.origin;
    const validateUrl = `${origin}/api/admin/session/validate`;
    
    console.log('[Middleware] Validating session for path:', path);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超時
    
    const res = await fetch(validateUrl, {
      method: "GET",
      headers: { 
        cookie,
        'x-middleware-validate': '1'  // 標記這是 middleware 的請求
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      console.log('[Middleware] Session data:', JSON.stringify(data));
      if (data?.valid) {
        isValidSession = true;
        userRole = data?.session?.role || null;
        console.log('[Middleware] User role:', userRole);
      }
    }
  } catch (e: any) {
    console.error("[Middleware] Session validate fetch error:", e?.message || e);
  }

  // 4. 角色權限檢查（無論開發還是正式環境都檢查）
  if (isValidSession && userRole === 'research_admin') {
    console.log('[Middleware] Checking research_admin permissions for path:', path);
    const isResearchPath = path.startsWith('/admin/research') || 
                           path.startsWith('/api/admin/research');
    const isLogoutPath = path === '/api/admin/logout' || path === '/admin/login';
    
    if (!isResearchPath && !isLogoutPath) {
      console.log('[Middleware] BLOCKING access - redirecting to research studio');
      // 非授權路徑，重導向到研究室
      if (isAdminApi) {
        return NextResponse.json(
          { success: false, message: "權限不足 - 您只能訪問研究室" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/admin/research/studio", req.url));
    }
    console.log('[Middleware] ALLOWING research_admin access to:', path);
  }

  // 5. 只在 production 或設定 ADMIN_PROTECT=1 時強制登入驗證
  const enforce =
    process.env.NODE_ENV === "production" ||
    process.env.ADMIN_PROTECT === "1";
  
  if (!enforce) {
    return response;
  }

  // 6. 已驗證的 session 允許通過
  if (isValidSession) {
    return response;
  }

  // 7. 驗證失敗
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
