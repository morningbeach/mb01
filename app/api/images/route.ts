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

    // 轉成前端 ImageAssetItem 需要的格式
    const images = files.map((file) => {
      const filename = file.key.split("/").pop() ?? file.key;
      return {
        id: file.key,        // 用 key 當 id 就好
        url: file.url,       // R2_PUBLIC_BASE_URL + key
        label: filename,     // 檔名當 label
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
