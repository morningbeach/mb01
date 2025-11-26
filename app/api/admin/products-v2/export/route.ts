import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CSV 表頭（所有 Product 欄位）
const CSV_HEADERS = [
  "id",
  "slug",
  "name",
  "name_en",
  "name_zh",
  "shortDesc",
  "shortDesc_en",
  "shortDesc_zh",
  "description",
  "description_en",
  "description_zh",
  "category",
  "sku",
  "minQty",
  "priceHint",
  "priceHint_en",
  "priceHint_zh",
  "currency",
  "seoTitle",
  "seoTitle_en",
  "seoTitle_zh",
  "seoDescription",
  "seoDescription_en",
  "seoDescription_zh",
  "dimensions",
  "dimensions_en",
  "dimensions_zh",
  "leadTime",
  "leadTime_en",
  "leadTime_zh",
  "materials",
  "materials_en",
  "materials_zh",
  "notesForBuyer",
  "notesForBuyer_en",
  "notesForBuyer_zh",
  "originCountry",
  "originCountry_en",
  "originCountry_zh",
  "packagingInfo",
  "packagingInfo_en",
  "packagingInfo_zh",
  "unit",
  "unit_en",
  "unit_zh",
  "status",
  "coverImage",
  "gallery",
  "images",
  "version",
  "tags",
  "createdAt",
  "updatedAt",
];

// 將值轉換為 CSV 安全格式
function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  
  // 陣列轉換為分號分隔的字串
  if (Array.isArray(value)) {
    return `"${value.join("; ").replace(/"/g, '""')}"`;
  }
  
  // 日期轉換
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  const str = String(value);
  
  // 如果包含逗號、換行或引號，需要用引號包裹
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

// 將產品轉換為 CSV 行
function productToCSVRow(product: any): string {
  const tagNames = product.tags?.map((pt: any) => pt.tag?.name || pt.tag?.slug).join("; ") || "";
  
  const values = [
    product.id,
    product.slug,
    product.name,
    product.name_en,
    product.name_zh,
    product.shortDesc,
    product.shortDesc_en,
    product.shortDesc_zh,
    product.description,
    product.description_en,
    product.description_zh,
    product.category,
    product.sku,
    product.minQty,
    product.priceHint,
    product.priceHint_en,
    product.priceHint_zh,
    product.currency,
    product.seoTitle,
    product.seoTitle_en,
    product.seoTitle_zh,
    product.seoDescription,
    product.seoDescription_en,
    product.seoDescription_zh,
    product.dimensions,
    product.dimensions_en,
    product.dimensions_zh,
    product.leadTime,
    product.leadTime_en,
    product.leadTime_zh,
    product.materials,
    product.materials_en,
    product.materials_zh,
    product.notesForBuyer,
    product.notesForBuyer_en,
    product.notesForBuyer_zh,
    product.originCountry,
    product.originCountry_en,
    product.originCountry_zh,
    product.packagingInfo,
    product.packagingInfo_en,
    product.packagingInfo_zh,
    product.unit,
    product.unit_en,
    product.unit_zh,
    product.status,
    product.coverImage,
    product.gallery,
    product.images,
    product.version,
    tagNames,
    product.createdAt,
    product.updatedAt,
  ];
  
  return values.map(escapeCSV).join(",");
}

// POST: 匯出選定的產品
export async function POST(request: NextRequest) {
  try {
    const { productIds, exportAll } = await request.json();
    
    let products;
    
    if (exportAll) {
      // 匯出全部 V2 產品
      products = await prisma.product.findMany({
        where: { version: 2 },
        include: {
          tags: { include: { tag: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (productIds && productIds.length > 0) {
      // 匯出選定的產品
      products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          version: 2,
        },
        include: {
          tags: { include: { tag: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json(
        { error: "請選擇要匯出的產品" },
        { status: 400 }
      );
    }
    
    // 建立 CSV 內容
    const csvLines = [
      CSV_HEADERS.join(","), // 表頭
      ...products.map(productToCSVRow), // 資料行
    ];
    
    const csvContent = "\uFEFF" + csvLines.join("\n"); // 加入 BOM 以支援 Excel 開啟中文
    
    // 回傳 CSV 檔案
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="products_export_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "匯出失敗" },
      { status: 500 }
    );
  }
}

// GET: 下載空白 CSV 範本
export async function GET() {
  // 建立一個範例資料行
  const sampleRow = [
    "", // id (自動生成，匯入時留空)
    "sample-product-slug", // slug *必填
    "Sample Product Name", // name *必填
    "Sample Product Name", // name_en
    "範例產品名稱", // name_zh
    "Short description", // shortDesc
    "Short description in English", // shortDesc_en
    "簡短描述中文", // shortDesc_zh
    "Detailed product description...", // description
    "Detailed description in English...", // description_en
    "詳細描述中文...", // description_zh
    "GIFT", // category (GIFT / GIFT_BOX / GIFT_SET)
    "SKU-001", // sku
    "500", // minQty
    "From $5.00/pc", // priceHint
    "From $5.00/pc", // priceHint_en
    "每個 $5.00 起", // priceHint_zh
    "TWD", // currency (TWD / USD / EUR)
    "SEO Title", // seoTitle
    "SEO Title English", // seoTitle_en
    "SEO 標題中文", // seoTitle_zh
    "SEO Description", // seoDescription
    "SEO Description English", // seoDescription_en
    "SEO 描述中文", // seoDescription_zh
    "20 x 15 x 8 cm", // dimensions
    "20 x 15 x 8 cm", // dimensions_en
    "20 x 15 x 8 公分", // dimensions_zh
    "15-20 days", // leadTime
    "15-20 business days", // leadTime_en
    "15-20 個工作天", // leadTime_zh
    "Paper, Cardboard", // materials
    "Paper, Cardboard", // materials_en
    "紙張、紙板", // materials_zh
    "Notes for buyer", // notesForBuyer
    "Notes for buyer", // notesForBuyer_en
    "買家須知", // notesForBuyer_zh
    "Taiwan", // originCountry
    "Taiwan", // originCountry_en
    "台灣", // originCountry_zh
    "12 pcs/carton", // packagingInfo
    "12 pcs/carton", // packagingInfo_en
    "12 個/箱", // packagingInfo_zh
    "pc", // unit
    "pc", // unit_en
    "個", // unit_zh
    "DRAFT", // status (DRAFT / ACTIVE / ARCHIVED)
    "https://example.com/cover.jpg", // coverImage
    "https://example.com/img1.jpg; https://example.com/img2.jpg", // gallery (分號分隔)
    "https://example.com/img1.jpg; https://example.com/img2.jpg", // images (分號分隔)
    "2", // version (固定為 2)
    "tag1; tag2; tag3", // tags (標籤名稱，分號分隔)
    "", // createdAt (自動生成)
    "", // updatedAt (自動生成)
  ];
  
  const csvLines = [
    CSV_HEADERS.join(","),
    sampleRow.map(escapeCSV).join(","),
  ];
  
  const csvContent = "\uFEFF" + csvLines.join("\n");
  
  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products_template.csv"`,
    },
  });
}
