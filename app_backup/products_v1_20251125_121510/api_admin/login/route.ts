// app/api/admin/login/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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

  const res = NextResponse.redirect(new URL("/admin", req.url), {
    status: 303, // ⭐ 關鍵
  });

  res.cookies.set("admin_session", user.id, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return res;
}
