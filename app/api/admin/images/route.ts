// app/api/admin/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { listR2Objects } from "@/lib/r2";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const prefix = searchParams.get("prefix") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // 1. 從 R2 列出所有檔案（取得總數需要一次取全部）
    const r2Files = await listR2Objects({ prefix, maxKeys: 1000 });
    
    // 過濾出圖片檔案（非資料夾）
    const imageFiles = r2Files.filter((f) => {
      const ext = f.key.split(".").pop()?.toLowerCase();
      return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
    });

    const total = imageFiles.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = imageFiles.slice(startIndex, endIndex);

    // 2. 從資料庫取得軟刪除標記（只查詢當前頁的）
    const images = await prisma.image.findMany({
      where: {
        storageKey: {
          in: paginatedFiles.map((f) => f.key),
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
    const files = paginatedFiles.map((file) => ({
      key: file.key,
      url: file.url,
      size: file.size,
      lastModified: file.lastModified,
      isDeleted: deletedMap.get(file.key) || false,
    }));

    return NextResponse.json({
      files,
      total,
      page,
      limit,
      hasMore: endIndex < total,
    });
  } catch (error) {
    console.error("列出圖片失敗:", error);
    return NextResponse.json(
      { error: "列出圖片失敗" },
      { status: 500 }
    );
  }
}
