// app/api/admin/images/soft-delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { url, storageKey } = await req.json();

    if (!url && !storageKey) {
      return NextResponse.json(
        { error: "需要提供 url 或 storageKey" },
        { status: 400 }
      );
    }

    // 查找或創建 Image 記錄
    let image = await prisma.image.findFirst({
      where: {
        OR: [
          url ? { url } : {},
          storageKey ? { storageKey } : {},
        ],
      },
    });

    if (!image && (url || storageKey)) {
      // 如果不存在，創建記錄
      image = await prisma.image.create({
        data: {
          url: url || "",
          storageKey: storageKey || url || "",
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    } else if (image) {
      // 如果存在，標記為已刪除
      image = await prisma.image.update({
        where: { id: image.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, image });
  } catch (err) {
    console.error("[API] soft delete error:", err);
    return NextResponse.json(
      { error: "軟刪除失敗" },
      { status: 500 }
    );
  }
}

// 恢復軟刪除的文件
export async function DELETE(req: NextRequest) {
  try {
    const { url, storageKey } = await req.json();

    const image = await prisma.image.findFirst({
      where: {
        OR: [
          url ? { url } : {},
          storageKey ? { storageKey } : {},
        ],
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: "找不到圖片記錄" },
        { status: 404 }
      );
    }

    const updated = await prisma.image.update({
      where: { id: image.id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return NextResponse.json({ success: true, image: updated });
  } catch (err) {
    console.error("[API] restore error:", err);
    return NextResponse.json(
      { error: "恢復失敗" },
      { status: 500 }
    );
  }
}
