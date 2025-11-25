// app/api/admin/images/route.ts
import { NextResponse } from "next/server";
import { listR2Images } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // 確保用 Node runtime（方便 AWS SDK）

export async function GET() {
  try {
    // 從 R2 列出圖片（預設 prefix = "uploads/"，maxKeys = 200）
    const files = await listR2Images({
      prefix: "uploads/",
      maxKeys: 200,
    });

    // 轉成前端 ImagePicker 需要的格式（包含資料夾路徑）
    const images = files.map((file) => {
      const parts = file.key.split("/");
      const filename = parts.pop() ?? file.key;
      const folder = parts.length > 1 ? parts.slice(1).join("/") : parts.join("/"); // 排除 "uploads/" 前綴
      
      return {
        id: file.key,        // 完整 key 當 id
        url: file.url,       // R2_PUBLIC_BASE_URL + key
        alt: filename,       // 檔名當 alt
        title: filename,     // 檔名當 title
        folder: folder || "root", // 資料夾路徑
        width: null,
        height: null,
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
