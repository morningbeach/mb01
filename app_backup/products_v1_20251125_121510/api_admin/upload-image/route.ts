// app/api/admin/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_WIDTH = 1920; // 最大寬度
const JPEG_QUALITY = 85; // JPEG 壓縮品質

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") as string | null;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "未提供檔案" },
        { status: 400 },
      );
    }

    // 驗證檔案類型
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `不支援的檔案格式。僅支援：${ALLOWED_IMAGE_TYPES.join(", ")}` },
        { status: 400 },
      );
    }

    // 驗證檔案大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `檔案過大。最大允許 3MB，當前檔案 ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    let buf = Buffer.from(arrayBuffer);

    const originalName = file.name || "image";
    const originalExt = path.extname(originalName).toLowerCase();
    
    // 使用 sharp 處理圖片
    try {
      const image = sharp(buf);
      const metadata = await image.metadata();

      // 如果圖片寬度超過最大寬度，進行縮放
      if (metadata.width && metadata.width > MAX_WIDTH) {
        image.resize(MAX_WIDTH, null, {
          withoutEnlargement: true,
          fit: "inside",
        });
      }

      // 根據原始格式壓縮
      if (originalExt === ".jpg" || originalExt === ".jpeg") {
        image.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
      } else if (originalExt === ".png") {
        image.png({ quality: JPEG_QUALITY, compressionLevel: 9 });
      } else if (originalExt === ".webp") {
        image.webp({ quality: JPEG_QUALITY });
      }

      buf = await image.toBuffer();
    } catch (imageError) {
      console.error("[IMAGE_PROCESSING_ERROR]", imageError);
      return NextResponse.json(
        { error: "圖片處理失敗，請確認檔案格式正確" },
        { status: 400 },
      );
    }

    const hash = crypto
      .createHash("md5")
      .update(buf)
      .digest("hex")
      .slice(0, 8);

    const ext = originalExt || ".jpg";
    const fileName = `${Date.now()}-${hash}${ext}`;
    
    // 支援資料夾路徑
    const key = folder && folder.trim()
      ? `uploads/${folder}/${fileName}`
      : `uploads/${fileName}`;
    
    const contentType = file.type;

    // 上傳到 R2
    const url = await uploadToR2(key, buf, contentType);

    // 寫入 Image 表
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

    return NextResponse.json({
      ok: true,
      id: image.id,
      url: image.url,
      label: image.title,
      originalSize: file.size,
      compressedSize: buf.byteLength,
      compressionRatio: ((1 - buf.byteLength / file.size) * 100).toFixed(1) + "%",
    });
  } catch (err) {
    console.error("[UPLOAD_IMAGE_ERROR]", err);
    return NextResponse.json(
      { error: "上傳失敗" },
      { status: 500 },
    );
  }
}
