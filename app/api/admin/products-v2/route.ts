import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - 建立新產品
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tagIds, ...productData } = body;

    // 確保 version 為 2
    const finalProductData = {
      ...productData,
      version: 2,
    };

    const product = await prisma.product.create({
      data: {
        ...finalProductData,
        // 創建 TAG 關聯
        tags: tagIds ? {
          create: tagIds.map((tagId: string) => ({
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
