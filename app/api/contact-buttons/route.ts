// app/api/contact-buttons/route.ts - 前台取得聯絡按鈕設定
import { NextResponse } from "next/server";
import { promises as fs } from 'fs';
import { join } from 'path';

const SETTINGS_FILE_PATH = join(process.cwd(), 'data', 'contact-buttons.json');

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
    try {
      const fileContent = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
      const settings = JSON.parse(fileContent);
      return NextResponse.json({ success: true, settings });
    } catch (error) {
      // 如果檔案不存在，返回預設資料
      return NextResponse.json({ success: true, settings: defaultSettings });
    }
  } catch (error) {
    console.error("載入聯絡按鈕設定失敗:", error);
    return NextResponse.json(
      { success: false, error: "載入失敗" },
      { status: 500 }
    );
  }
}
