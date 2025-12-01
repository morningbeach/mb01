// app/api/admin/footer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FOOTER_KEY = "footer";

// 預設頁腳資料（新結構）
function normalizeFooterData(data: any) {
  if (!data) return data;
  const fallbackLogos = Array.isArray(data.clientLogos) ? data.clientLogos : [];
  return {
    ...data,
    clientLogosZh: Array.isArray(data.clientLogosZh) ? data.clientLogosZh : fallbackLogos,
    clientLogosEn: Array.isArray(data.clientLogosEn) ? data.clientLogosEn : fallbackLogos,
  };
}

const defaultFooterData = normalizeFooterData({
  id: "main-footer",
  companyInfo: {
    taiwan: {
      name: "明日島嶼有限公司",
      nameEn: "Morning Beach Co., Ltd.",
      taxId: "89188386"
    },
    china: {
      name: "天玎纸品包装有限公司",
      nameEn: "Tianding Paper Packaging Co., Ltd."
    }
  },
  addresses: {
    taiwan: "台灣高雄市左營區立大路377巷6弄3號 (來訪請先預約)",
    taiwanEn: "No. 3, Aly. 6, Ln. 377, Lida Rd., Zuoying Dist., Kaohsiung City, Taiwan (By appointment only)",
    china: "广东省深圳市龙岗区平湖镇峨公岭湖田路16号盈冠工业园1栋3楼",
    chinaEn: "3F, Building 1, Yingguan Industrial Park, No.16 Hutian Road, Egongling, Pinghu Town, Longgang District, Shenzhen, Guangdong, China"
  },
  contact: {
    phone: ["(07)3450928"],
    mobile: "0963581855",
    email: "morningbeachtw@gmail.com"
  },
  clientLogosZh: [],
  clientLogosEn: [],
  qrCodes: {
    line: {
      enabled: true,
      url: "https://lin.ee/JRPBhOm",
      imageUrl: "https://img.mbpack.co/uploads/1764581109210-2d829e59.png",
      description: "掃碼加 LINE 好友",
      descriptionEn: "Scan to add LINE friend"
    },
    whatsapp: {
      enabled: true,
      url: "https://wa.me/886963581855",
      imageUrl: "",
      description: "掃碼聯絡 WhatsApp",
      descriptionEn: "Scan to contact via WhatsApp"
    }
  },
  socialLinks: {
    youtube: "",
    pinterest: "",
    instagram: "",
    facebook: ""
  }
});

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: FOOTER_KEY }
    });

    if (setting) {
      return NextResponse.json({ success: true, footer: normalizeFooterData(setting.value) });
    }

    // 如果資料庫沒有，返回預設資料
    return NextResponse.json({ success: true, footer: defaultFooterData });
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
      ...normalizeFooterData(footerData),
      updatedAt: new Date().toISOString()
    };

    // 使用 upsert 來建立或更新
    const saved = await prisma.siteSetting.upsert({
      where: { key: FOOTER_KEY },
      update: { value: dataToSave },
      create: { 
        key: FOOTER_KEY,
        value: dataToSave
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "頁腳設定已儲存",
      footer: saved.value 
    });
  } catch (error) {
    console.error("儲存頁腳資料失敗:", error);
    return NextResponse.json(
      { success: false, error: "儲存失敗" },
      { status: 500 }
    );
  }
}