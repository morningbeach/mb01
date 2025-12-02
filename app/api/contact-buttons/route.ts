// app/api/contact-buttons/route.ts - 前台取得聯絡按鈕設定
import { NextResponse } from "next/server";
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
    // 發生錯誤時返回預設值，避免前台壞掉
    return NextResponse.json({ success: true, settings: defaultSettings });
  }
}
