// middleware.ts
import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;
  const path = url.pathname;

  // 只保護 /admin 路徑
  if (!path.startsWith("/admin")) {
    return NextResponse.next();
  }

  // 開發環境允許直接進入（Codespace、本地）
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // Production → Basic Auth
  const authHeader = req.headers.get("authorization");
  const USER = process.env.ADMIN_BASIC_USER;
  const PASS = process.env.ADMIN_BASIC_PASS;

  if (!USER || !PASS) {
    return new NextResponse("Admin credentials not set", { status: 500 });
  }

  // 沒認證
  if (!authHeader) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="MB Admin"`,
      },
    });
  }

  // 解析 Base64
  const encoded = authHeader.split(" ")[1];
  const decoded = Buffer.from(encoded, "base64").toString();
  const [reqUser, reqPass] = decoded.split(":");

  // 驗證錯誤
  if (reqUser !== USER || reqPass !== PASS) {
    return new NextResponse("Invalid credentials", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="MB Admin"`,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
