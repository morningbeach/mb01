// app/api/admin/login/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { setSession } from "@/lib/kv";
export const runtime = "nodejs";

export async function GET() {
  return new NextResponse("Admin login endpoint", { status: 200 });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = (formData.get("email") || "").toString().trim();
  const password = (formData.get("password") || "").toString();

  if (!email || !password) {
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url), {
      status: 303,
    });
  }

  const user = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url), {
      status: 303,
    });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url), {
      status: 303,
    });
  }
  // Create opaque session id and store in Vercel KV
  const maxAge = 60 * 60 * 8; // 8 hours
  const sid = crypto.randomBytes(32).toString("hex");
  const session = { userId: user.id, createdAt: Date.now() };

  const success = await setSession(sid, session, maxAge);
  if (!success) {
    return new NextResponse("Session store error", { status: 500 });
  }

  const res = NextResponse.redirect(new URL("/admin", req.url), {
    status: 303,
  });

  res.cookies.set("admin_session", sid, {
    httpOnly: true,
    path: "/",  // 使用根路徑確保所有 API 路由都能讀取
    maxAge,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res;
}
