// app/api/admin/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // 必須使用 Node runtime，AWS SDK 才正常

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type || "application/octet-stream";

    // 處理檔名：時間戳 + 隨機字串，避免重複
    const ext = file.name.includes(".")
      ? file.name.split(".").pop()
      : "bin";
    const safeExt = ext?.toLowerCase() || "bin";

    const key = `uploads/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${safeExt}`;

    // 丟去 R2
    const url = await uploadToR2(key, buffer, contentType);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[UPLOAD_IMAGE] error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }
}
