// app/api/contact/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      company,
      phone,
      inquiryType = "GENERAL",
      productType,
      quantity,
      timeline,
      budget,
      message,
      source = "website"
    } = body;

    // 基本驗證
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email and message are required" },
        { status: 400 }
      );
    }

    // Email 格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // 取得客戶資訊
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 儲存到資料庫
    const inquiry = await prisma.contactInquiry.create({
      data: {
        id: randomUUID(),
        name,
        email,
        company,
        phone,
        inquiryType,
        productType,
        quantity,
        timeline,
        budget,
        message,
        source,
        ipAddress,
        userAgent,
        status: "NEW",
        updatedAt: new Date(),
      },
    });

    // TODO: 發送通知郵件給管理員（可選）
    // await sendNotificationEmail(inquiry);

    return NextResponse.json({
      success: true,
      message: "Thank you for contacting us! We will get back to you soon.",
      inquiryId: inquiry.id,
    });
  } catch (error: any) {
    console.error("[Contact Submit Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
