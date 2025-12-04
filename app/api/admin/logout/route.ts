import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|; )admin_session=([^;]+)/);
  const sid = match ? decodeURIComponent(match[1]) : null;

  if (sid) {
    await deleteSession(sid);
  }

  // 清除 landing-v2-config 中的 API Key
  try {
    const existing = await prisma.siteSetting.findUnique({
      where: { key: "landing-v2-config" },
    });
    
    if (existing && existing.value) {
      const config = existing.value as any;
      if (config.aiSettings) {
        // 清除 API Keys
        config.aiSettings = { openaiKey: "", geminiKey: "" };
        await prisma.siteSetting.update({
          where: { key: "landing-v2-config" },
          data: { value: config, updatedAt: new Date() },
        });
        console.log("[Logout] Cleared AI API Keys from config");
      }
    }
  } catch (error) {
    console.error("[Logout] Failed to clear API keys:", error);
    // 不中斷登出流程
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
