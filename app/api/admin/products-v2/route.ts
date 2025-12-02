import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - 建立新產品
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tagIds: rawTagIds, ...productData } = body;

    // 嚴謹處理 tagIds：過濾空值、確保為字串陣列
    let validTagIds: string[] = [];
    if (rawTagIds && Array.isArray(rawTagIds)) {
      validTagIds = rawTagIds
        .filter((id: any) => id !== null && id !== undefined && id !== '')
        .map((id: any) => String(id));
    }

    // 驗證 tagIds 是否存在於資料庫（如果有的話）
    if (validTagIds.length > 0) {
      const existingTags = await prisma.tag.findMany({
        where: { id: { in: validTagIds } },
        select: { id: true },
      });
      const existingIds = new Set(existingTags.map(t => t.id));
      const invalidIds = validTagIds.filter(id => !existingIds.has(id));
      
      if (invalidIds.length > 0) {
        console.warn(`無效的 tagIds 被過濾掉: ${invalidIds.join(', ')}`);
        validTagIds = validTagIds.filter(id => existingIds.has(id));
      }
    }

    // 檢查 SKU 是否已被使用
    if (productData.sku && productData.sku.trim() !== '') {
      const existingProduct = await prisma.product.findFirst({
        where: { sku: productData.sku.trim() },
      });

      if (existingProduct) {
        return NextResponse.json(
          { 
            success: false, 
            message: `SKU "${productData.sku}" 已被其他產品使用\n產品名稱：${existingProduct.name}\n產品 ID：${existingProduct.id}`,
          },
          { status: 400 }
        );
      }
    }
    
    // 如果 SKU 是空字串，轉換為 null
    if (productData.sku === '' || (typeof productData.sku === 'string' && productData.sku.trim() === '')) {
      productData.sku = null;
    }

    // 確保 version 為 2
    const finalProductData = {
      ...productData,
      version: 2,
    };

    const product = await prisma.product.create({
      data: {
        ...finalProductData,
        // 創建 TAG 關聯（只有當有效的 tagIds 時）
        ProductTag: validTagIds.length > 0 ? {
          create: validTagIds.map((tagId: string) => ({
            tagId,
          })),
        } : undefined,
      },
      include: {
        ProductTag: {
          include: { Tag: true },
        },
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("建立產品失敗:", error);
    
    // 提供更詳細的錯誤訊息
    let errorMessage = error.message || "建立產品失敗";
    let statusCode = 500;
    
    // Prisma 唯一約束錯誤
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || '欄位';
      errorMessage = `${field} 已存在，請使用不同的值`;
      statusCode = 400;
    }
    // Prisma 外鍵約束錯誤
    else if (error.code === 'P2003') {
      errorMessage = `關聯資料不存在（可能是無效的 tagId）`;
      statusCode = 400;
    }
    // 資料驗證錯誤
    else if (error.code === 'P2025') {
      errorMessage = `找不到相關資料`;
      statusCode = 400;
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage, code: error.code },
      { status: statusCode }
    );
  }
}

// GET - 取得所有 V2 產品
export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { version: 2 },
      include: {
        ProductTag: {
          include: { Tag: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error("取得產品列表失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "取得產品列表失敗" },
      { status: 500 }
    );
  }
}
