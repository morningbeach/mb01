// app/api/admin/contact-buttons/route.ts - 後台管理聯絡按鈕設定
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import { join } from 'path';

const SETTINGS_FILE_PATH = join(process.cwd(), 'data', 'contact-buttons.json');

// 確保目錄存在
async function ensureDataDirectory() {
  const dataDir = join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

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
    await ensureDataDirectory();
    
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

    await ensureDataDirectory();
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');

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
