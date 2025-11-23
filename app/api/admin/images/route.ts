// app/api/admin/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { listR2Objects } from "@/lib/r2";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const prefix = searchParams.get("prefix") || "uploads/";

    // 1. 從 R2 列出所有檔案（預設從 uploads/ 開始）
    const r2Files = await listR2Objects({ prefix, maxKeys: 1000 });

    // 2. 從資料庫取得軟刪除標記
    const images = await prisma.image.findMany({
      where: {
        storageKey: {
          in: r2Files.map((f) => f.key),
        },
      },
      select: {
        storageKey: true,
        isDeleted: true,
      },
    });

    const deletedMap = new Map(
      images.map((img) => [img.storageKey, img.isDeleted])
    );

    // 3. 合併資料
    const files = r2Files.map((file) => ({
      key: file.key,
      url: file.url,
      size: file.size,
      lastModified: file.lastModified,
      isDeleted: deletedMap.get(file.key) || false,
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("列出圖片失敗:", error);
    return NextResponse.json(
      { error: "列出圖片失敗" },
      { status: 500 }
    );
  }
}
