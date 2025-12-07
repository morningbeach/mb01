// app/api/ai/inquiry/route.ts
// 公開 API - 收集達到限制時的 Email 詢價
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 取得客戶端 IP
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const { email, productId, message } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: "請提供 Email" },
        { status: 400 }
      );
    }
    
    // 簡單的 Email 驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Email 格式不正確" },
        { status: 400 }
      );
    }
    
    const ipAddress = getClientIP(request);
    
    // 儲存詢價記錄
    await prisma.aiInquiry.create({
      data: {
        email,
        ipAddress,
        productId: productId || null,
        message: message || null,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "感謝您的詢問，我們會盡快與您聯繫！",
    });
    
  } catch (error: any) {
    console.error("[AI Inquiry] POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
