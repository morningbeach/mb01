// app/api/admin/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") as string | null;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    const originalName = file.name || "image";
    const ext = path.extname(originalName) || ".jpg";

    const hash = crypto
      .createHash("md5")
      .update(buf)
      .digest("hex")
      .slice(0, 8);

    const fileName = `${Date.now()}-${hash}${ext}`;
    
    // 自動按日期建立資料夾結構：uploads/YYYY-MM-DD/
    let basePath = folder || "uploads/";
    if (!folder || folder === "uploads/") {
      const today = new Date();
      const dateFolder = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      basePath = `uploads/${dateFolder}/`;
    }
    
    // 如果是建立資料夾（.keep檔），直接用folder作為key
    const key = originalName === ".keep" && folder 
      ? `${basePath}.keep` 
      : `${basePath}${fileName}`;
    const contentType = file.type || "application/octet-stream";

    // 上傳到 R2
    const url = await uploadToR2(key, buf, contentType);

    // 寫入 Image 表，給 Product / Album / Library 共用
    const image = await prisma.image.upsert({
      where: { url },
      update: {},
      create: {
        url,
        storageKey: key,
        size: buf.byteLength,
        mimeType: contentType,
        title: originalName,
      },
    });

    // ⚠️ 你的前端只需要 data.url，就能 setValue(data.url)
    return NextResponse.json({
      ok: true,
      id: image.id,
      url: image.url,
      label: image.title,
    });
  } catch (err) {
    console.error("[UPLOAD_IMAGE_ERROR]", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }
}
