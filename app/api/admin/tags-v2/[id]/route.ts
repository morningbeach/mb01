import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - 取得單一標籤
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!tag || tag.version !== 2) {
      return NextResponse.json(
        { success: false, message: "標籤不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, tag });
  } catch (error: any) {
    console.error("取得標籤失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "取得標籤失敗" },
      { status: 500 }
    );
  }
}

// PUT - 更新標籤
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { version, createdAt, updatedAt, ...updateData } = body;

    const tag = await prisma.tag.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, tag });
  } catch (error: any) {
    console.error("更新標籤失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "更新標籤失敗" },
      { status: 500 }
    );
  }
}

// DELETE - 刪除標籤
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        { success: false, message: "標籤不存在" },
        { status: 404 }
      );
    }

    if (tag._count.products > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `此標籤被 ${tag._count.products} 個產品使用中，無法刪除`,
        },
        { status: 400 }
      );
    }

    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "標籤已成功刪除",
    });
  } catch (error: any) {
    console.error("刪除標籤失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "刪除標籤失敗" },
      { status: 500 }
    );
  }
}
