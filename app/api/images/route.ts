// app/api/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { listR2Images } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // 確保用 Node runtime（方便 AWS SDK）

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const prefix = searchParams.get("prefix") || "uploads/";
    const limitParam = Number(searchParams.get("limit"));
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(Math.floor(limitParam), 1), 500)
      : 200;

    // 擴大抓取範圍確保能包含最新檔案
    const fetchSize = Math.max(limit * 2, 400);

    const files = await listR2Images({
      prefix,
      maxKeys: Math.min(fetchSize, 1000),
    });

    // 排序：lastModified 可能是 Date 物件
    const sorted = files.sort((a, b) => {
      const aTime = a.lastModified instanceof Date ? a.lastModified.getTime() : 0;
      const bTime = b.lastModified instanceof Date ? b.lastModified.getTime() : 0;
      return bTime - aTime;
    });

    const limited = sorted.slice(0, limit);

    // 轉成前端 ImagePicker 需要的格式（包含資料夾路徑）
    const images = limited.map((file) => {
      const parts = file.key.split("/");
      const filename = parts.pop() ?? file.key;
      const folder = parts.length > 1 ? parts.slice(1).join("/") : parts.join("/"); // 排除 "uploads/" 前綴
      
      // lastModified 是 Date 物件，需要轉換
      const lastModifiedStr = file.lastModified instanceof Date 
        ? file.lastModified.toISOString() 
        : null;

      return {
        id: file.key,        // 完整 key 當 id
        url: file.url,       // R2_PUBLIC_BASE_URL + key
        alt: filename,       // 檔名當 alt
        title: filename,     // 檔名當 title
        folder: folder || "root", // 資料夾路徑
        width: null,
        height: null,
        lastModified: lastModifiedStr,
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
