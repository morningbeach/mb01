// app/api/admin/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 方便直接在瀏覽器打 /api/admin/upload-image 測試是不是 404
export async function GET() {
  return NextResponse.json({
    ok: false,
    message: "Use POST with multipart/form-data to upload image.",
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      console.error("[UPLOAD_IMAGE] no file in formData");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name || "upload";
    const ext = path.extname(originalName) || ".jpg";
    const hash = crypto.randomBytes(8).toString("hex");
    const fileName = `${Date.now()}-${hash}${ext}`;

    // 寫到 public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    const image = await prisma.imageAsset.create({
      data: {
        url: publicUrl,
        label: originalName,
      },
    });

    console.log("[UPLOAD_IMAGE] saved", publicUrl);

    return NextResponse.json({
      ok: true,
      id: image.id,
      url: image.url,
      label: image.label,
    });
  } catch (error) {
    console.error("[UPLOAD_IMAGE_ERROR]", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
