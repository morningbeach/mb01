import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type Params = {
  params: Promise<{ id: string }>;
};

// GET - 取得單一 section
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const sectionId = parseInt(id);

    const section = await prisma.homeSection.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ section });
  } catch (error) {
    console.error("GET section error:", error);
    return NextResponse.json(
      { error: "Failed to fetch section" },
      { status: 500 }
    );
  }
}

// PUT - 更新 section
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const sectionId = parseInt(id);
    const body = await req.json();
    const { payload } = body;

    const section = await prisma.homeSection.update({
      where: { id: sectionId },
      data: { payload },
    });

    revalidatePath("/admin/homepage");
    revalidatePath("/");

    return NextResponse.json({ ok: true, section });
  } catch (error) {
    console.error("PUT section error:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}

// PATCH - 部分更新 section（啟用/停用、排序）
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const sectionId = parseInt(id);
    const body = await req.json();

    // 處理排序調整
    if (body.order !== undefined) {
      const currentSection = await prisma.homeSection.findUnique({
        where: { id: sectionId },
      });

      if (!currentSection) {
        return NextResponse.json(
          { error: "Section not found" },
          { status: 404 }
        );
      }

      const oldOrder = currentSection.order;
      const newOrder = body.order;

      // 在交易中處理排序調整
      await prisma.$transaction(async (tx) => {
        if (newOrder < oldOrder) {
          // 上移：將中間的區塊順序 +1
          await tx.homeSection.updateMany({
            where: {
              order: {
                gte: newOrder,
                lt: oldOrder,
              },
            },
            data: {
              order: {
                increment: 1,
              },
            },
          });
        } else {
          // 下移：將中間的區塊順序 -1
          await tx.homeSection.updateMany({
            where: {
              order: {
                gt: oldOrder,
                lte: newOrder,
              },
            },
            data: {
              order: {
                decrement: 1,
              },
            },
          });
        }

        // 更新目標區塊的順序
        await tx.homeSection.update({
          where: { id: sectionId },
          data: { order: newOrder },
        });
      });
    } else {
      // 普通更新（如啟用/停用）
      await prisma.homeSection.update({
        where: { id: sectionId },
        data: body,
      });
    }

    revalidatePath("/admin/homepage");
    revalidatePath("/");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH section error:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}

// DELETE - 刪除 section
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const sectionId = parseInt(id);

    await prisma.homeSection.delete({
      where: { id: sectionId },
    });

    revalidatePath("/admin/homepage");
    revalidatePath("/");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE section error:", error);
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    );
  }
}
