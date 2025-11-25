import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - 建立新標籤
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
          select: { products: true },
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
