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

    // 確保 version 為 2
    const finalProductData = {
      ...productData,
      version: 2,
    };

    const product = await prisma.product.create({
      data: {
        ...finalProductData,
        // 創建 TAG 關聯（只有當有有效的 tagIds 時）
        tags: validTagIds.length > 0 ? {
          create: validTagIds.map((tagId: string) => ({
            tagId,
          })),
        } : undefined,
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("建立產品失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "建立產品失敗" },
      { status: 500 }
    );
  }
}

// GET - 取得所有 V2 產品
export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { version: 2 },
      include: {
        tags: {
          include: { tag: true },
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
