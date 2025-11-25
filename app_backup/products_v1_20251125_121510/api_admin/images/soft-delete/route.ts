// app/api/admin/images/soft-delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: 軟刪除（標記為已刪除）
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keys } = body;

    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json(
        { error: "keys 必須是非空陣列" },
        { status: 400 }
      );
    }

    // 找出已存在的圖片
    const existingImages = await prisma.image.findMany({
      where: { storageKey: { in: keys } },
      select: { storageKey: true },
    });

    const existingKeys = new Set(existingImages.map((img) => img.storageKey));

    // 建立不存在的圖片記錄
    const newKeys = keys.filter((key) => !existingKeys.has(key));
    if (newKeys.length > 0) {
      await prisma.image.createMany({
        data: newKeys.map((key) => ({
          storageKey: key,
          url: `${process.env.R2_PUBLIC_BASE_URL}/${key}`,
          isDeleted: true,
        })),
        skipDuplicates: true,
      });
    }

    // 更新已存在的圖片為軟刪除
    if (existingKeys.size > 0) {
      await prisma.image.updateMany({
        where: { storageKey: { in: Array.from(existingKeys) } },
        data: { isDeleted: true },
      });
    }

    return NextResponse.json({ success: true, count: keys.length });
  } catch (error) {
    console.error("軟刪除失敗:", error);
    return NextResponse.json(
      { error: "軟刪除失敗" },
      { status: 500 }
    );
  }
}

// DELETE: 恢復檔案（取消刪除標記）
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { keys } = body;

    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json(
        { error: "keys 必須是非空陣列" },
        { status: 400 }
      );
    }

    await prisma.image.updateMany({
      where: { storageKey: { in: keys } },
      data: { isDeleted: false },
    });

    return NextResponse.json({ success: true, count: keys.length });
  } catch (error) {
    console.error("恢復檔案失敗:", error);
    return NextResponse.json(
      { error: "恢復檔案失敗" },
      { status: 500 }
    );
  }
}
