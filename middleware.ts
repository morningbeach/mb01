// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

// Note: middleware runs in the Edge runtime — avoid heavy Node APIs here.

// 不需要驗證的路徑（登入頁、API 路由等）
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/session/validate",
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. 檢查是否為公開路徑（不需要驗證）
  if (PUBLIC_ADMIN_PATHS.some((p) => path === p || path.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // 2. 只保護 /admin 和 /api/admin 開頭的路由
  const isAdminPage = path.startsWith("/admin");
  const isAdminApi = path.startsWith("/api/admin");
  
  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // 3. 只在 production 或設定 ADMIN_PROTECT=1 時強制驗證
  const enforce =
    process.env.NODE_ENV === "production" ||
    process.env.ADMIN_PROTECT === "1";
  if (!enforce) {
    return NextResponse.next();
  }

  // 4. 驗證 session cookie
  const cookie = req.headers.get("cookie") || "";
  try {
    const validateUrl = new URL("/api/admin/session/validate", req.url);
    const res = await fetch(validateUrl.toString(), {
      method: "GET",
      headers: { cookie },
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.valid) {
        return NextResponse.next();
      }
    }
  } catch (e) {
    console.error("Session validate fetch error:", e);
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
  // 匹配 /admin 和 /api/admin 路徑
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
