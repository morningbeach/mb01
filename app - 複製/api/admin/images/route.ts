// app/api/admin/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { listR2Images } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get("prefix") || "uploads/";

    // 從 R2 列出圖片
    const files = await listR2Images({
      prefix,
      maxKeys: 200,
    });

    // 檢查資料庫中哪些文件已被軟刪除
    const { prisma } = await import("@/lib/prisma");
    const deletedImages = await prisma.image.findMany({
      where: {
        isDeleted: true,
      },
      select: {
        url: true,
        storageKey: true,
      },
    });

    const deletedUrls = new Set(deletedImages.map(img => img.url));
    const deletedKeys = new Set(deletedImages.map(img => img.storageKey));

    // 過濾掉已軟刪除的文件
    const activeFiles = files.filter(file => 
      !deletedUrls.has(file.url) && !deletedKeys.has(file.key)
    );

    // 轉成前端 ImageAssetItem 需要的格式
    const images = activeFiles.map((file) => {
      const filename = file.key.split("/").pop() ?? file.key;
      return {
        id: file.key,
        key: file.key,
        url: file.url,
        label: filename,
        size: file.size,
        lastModified: file.lastModified?.toISOString() || new Date().toISOString(),
      };
    });

    return NextResponse.json({ images });
  } catch (err) {
    console.error("[R2] list images error:", err);
    return NextResponse.json(
      { error: "Failed to list images from R2" },
      { status: 500 },
    );
  }
}
