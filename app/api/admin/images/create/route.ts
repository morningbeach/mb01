// app/api/admin/images/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, storageKey, alt, title, width, height, size, mimeType } = body;

    if (!url || !storageKey) {
      return NextResponse.json(
        { success: false, error: "缺少必要欄位：url 和 storageKey" },
        { status: 400 }
      );
    }

    // 檢查是否已存在
    const existing = await prisma.image.findFirst({
      where: {
        OR: [
          { url: url },
          { storageKey: storageKey },
        ],
      },
    });

    if (existing) {
      // 如果已存在，更新資料
      const updated = await prisma.image.update({
        where: { id: existing.id },
        data: {
          alt: alt || existing.alt,
          title: title || existing.title,
          isDeleted: false, // 確保不是軟刪除狀態
        },
      });
      return NextResponse.json({ success: true, image: updated, existed: true });
    }

    // 建立新的 Image 記錄
    const image = await prisma.image.create({
      data: {
        url,
        storageKey,
        alt: alt || null,
        title: title || null,
        width: width || null,
        height: height || null,
        size: size || null,
        mimeType: mimeType || null,
        isDeleted: false,
      },
    });

    return NextResponse.json({ success: true, image });
  } catch (error: any) {
    console.error("建立 Image 記錄失敗:", error);
    return NextResponse.json(
      { success: false, error: error.message || "建立失敗" },
      { status: 500 }
    );
  }
}
