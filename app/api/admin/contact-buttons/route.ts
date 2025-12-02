// app/api/admin/contact-buttons/route.ts - 後台管理聯絡按鈕設定
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 預設聯絡按鈕設定
const defaultSettings = {
  line: {
    enabled: true,
    url: "https://lin.ee/JRPBhOm",
    label_zh: "LINE 詢價",
    label_en: "LINE Quote"
  },
  whatsapp: {
    enabled: true,
    number: "+886963581855",
    label_zh: "WhatsApp",
    label_en: "WhatsApp"
  },
  email: {
    enabled: true,
    address: "morningbeachtw@gmail.com",
    label_zh: "Email",
    label_en: "Email"
  },
  updatedAt: new Date().toISOString()
};

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "contact-buttons" },
    });

    if (setting && setting.value) {
      return NextResponse.json({ success: true, settings: setting.value });
    }

    return NextResponse.json({ success: true, settings: defaultSettings });
  } catch (error) {
    console.error("載入聯絡按鈕設定失敗:", error);
    return NextResponse.json(
      { success: false, error: "載入失敗" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { success: false, error: "缺少設定資料" },
        { status: 400 }
      );
    }

    // 添加更新時間
    const dataToSave = {
      ...settings,
      updatedAt: new Date().toISOString()
    };

    await prisma.siteSetting.upsert({
      where: { key: "contact-buttons" },
      update: { value: dataToSave },
      create: { 
        id: "contact-buttons", // 明確指定 ID 以避免與預設值 "main" 衝突
        key: "contact-buttons", 
        value: dataToSave 
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "聯絡按鈕設定已儲存",
      settings: dataToSave
    });
  } catch (error) {
    console.error("儲存聯絡按鈕設定失敗:", error);
    return NextResponse.json(
      { success: false, error: "儲存失敗" },
      { status: 500 }
    );
  }
}
