// app/api/admin/footer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import { join } from 'path';

const FOOTER_FILE_PATH = join(process.cwd(), 'data', 'footer.json');

// 確保目錄存在
async function ensureDataDirectory() {
  const dataDir = join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// 預設頁腳資料
const defaultFooterData = {
  id: "main-footer",
  companyInfo: {
    taiwan: {
      name: "明日島嶼有限公司",
      taxId: "89188386"
    },
    china: {
      name: "天玎纸品包装有限公司"
    }
  },
  addresses: {
    taiwan: "台灣高雄市左營區立大路377巷6弄3號 (來訪請先預約)",
    china: "广东省深圳市龙岗区平湖镇峨公岭湖田路16号盈冠工业园1栋3楼"
  },
  contact: {
    phone: ["(07)3450928"],
    mobile: "0963581855",
    email: "morningbeachtw@gmail.com"
  },
  clients: [
    "碳佐麻里", "斑鳩的窩", "鮮乳坊", "喫茶小舖", "老牛皮La New", 
    "91app", "四皇國際有限公司", "誠品生活", "迪卡儂", "薰衣草森林",
    "新北市政府文化局", "余靜萍工作室有限公司", "統一棒球隊股份有限公司"
  ],
  qrCode: {
    enabled: true,
    url: "https://lin.ee/JRPBhOm",
    imageUrl: "https://img.mbpack.co/uploads/homepage/1764300510856-73b4be9a.png",
    description: "掃碼加 LINE 好友"
  },
  socialLinks: {
    line: "https://lin.ee/JRPBhOm"
  },
  updatedAt: new Date().toISOString()
};

export async function GET() {
  try {
    await ensureDataDirectory();
    
    try {
      const fileContent = await fs.readFile(FOOTER_FILE_PATH, 'utf-8');
      const footerData = JSON.parse(fileContent);
      return NextResponse.json({ success: true, footer: footerData });
    } catch (error) {
      // 如果檔案不存在，返回預設資料
      return NextResponse.json({ success: true, footer: defaultFooterData });
    }
  } catch (error) {
    console.error("載入頁腳資料失敗:", error);
    return NextResponse.json(
      { success: false, error: "載入失敗" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { footerData } = body;

    if (!footerData) {
      return NextResponse.json(
        { success: false, error: "缺少頁腳資料" },
        { status: 400 }
      );
    }

    // 添加更新時間
    const dataToSave = {
      ...footerData,
      updatedAt: new Date().toISOString()
    };

    await ensureDataDirectory();
    await fs.writeFile(FOOTER_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: "頁腳設定已儲存",
      footer: dataToSave 
    });
  } catch (error) {
    console.error("儲存頁腳資料失敗:", error);
    return NextResponse.json(
      { success: false, error: "儲存失敗" },
      { status: 500 }
    );
  }
}