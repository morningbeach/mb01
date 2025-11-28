import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|; )admin_session=([^;]+)/);
  const sid = match ? decodeURIComponent(match[1]) : null;

  if (sid) {
    await deleteSession(sid);
  }

  const res = NextResponse.redirect(new URL("/admin/login", req.url));
  // 清除 cookie - 使用相同的 path 設定
  res.cookies.set("admin_session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return res;
}

export async function GET(req: Request) {
  // allow GET for convenience
  return POST(req);
}
