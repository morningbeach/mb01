import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - 建立新標籤
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 檢查 slug 是否重複
    if (body.slug) {
      const existingTag = await prisma.tag.findFirst({
        where: { slug: body.slug }
      });
      
      if (existingTag) {
        return NextResponse.json(
          { success: false, message: `標籤 slug "${body.slug}" 已存在，請使用其他名稱` },
          { status: 400 }
        );
      }
    }

    const tagData = {
      ...body,
      version: 2,
    };

    const tag = await prisma.tag.create({
      data: tagData,
    });

    return NextResponse.json({ success: true, tag });
  } catch (error: any) {
    console.error("建立標籤失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "建立標籤失敗" },
      { status: 500 }
    );
  }
}

// GET - 取得所有 V2 標籤
export async function GET(req: NextRequest) {
  try {
    const tags = await prisma.tag.findMany({
      where: { version: 2 },
      include: {
        _count: {
          select: { ProductTag: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, tags });
  } catch (error: any) {
    console.error("取得標籤列表失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "取得標籤列表失敗" },
      { status: 500 }
    );
  }
}
