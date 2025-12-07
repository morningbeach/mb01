import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - 公開取得單一產品基本資料（供 AI 設計頁使用）
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        name: true,
        name_en: true,
        coverImage: true,
        enableAiGen: true,
        status: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "產品不存在" },
        { status: 404 }
      );
    }

    // 只允許公開的產品或有 AI 功能的產品
    if (product.status !== "ACTIVE" && !product.enableAiGen) {
      return NextResponse.json(
        { error: "產品不可用" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("取得產品失敗:", error);
    return NextResponse.json(
      { error: "取得產品失敗" },
      { status: 500 }
    );
  }
}
