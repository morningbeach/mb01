// app/api/admin/gift-box-radar/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { uploadToR2 } from "@/lib/r2";
import sharp from "sharp";

interface ExportRequest {
  assets?: Array<{
    imageUrl: string;
    title: string;
    id: string;
  }>;
  imageUrls?: string[];
}

async function validateAdminAccess(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const sessionId = cookieStore.get("admin_session")?.value;
    
    if (!sessionId) {
      return false;
    }
    
    const session = await getSession(sessionId);
    return !!session?.userId;
  } catch {
    return false;
  }
}

async function downloadImage(url: string, timeout: number = 15000): Promise<Buffer> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  } finally {
    clearTimeout(timeoutId);
  }
}

async function processImage(imageBuffer: Buffer, filename: string): Promise<{ buffer: Buffer; url: string }> {
  try {
    // 使用 sharp 轉換為 1:1 JPG
    const processed = await sharp(imageBuffer)
      .resize(800, 800, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    // 上傳到 R2 (key, body, contentType)
    const key = `gift-box-radar/${filename}.jpg`;
    const uploadedUrl = await uploadToR2(key, processed, "image/jpeg");

    return { buffer: processed, url: uploadedUrl };
  } catch (error) {
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 驗證管理員身份
    const isAdmin = await validateAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: ExportRequest = await req.json();
    
    // 支持兩種格式：assets 陣列或 imageUrls 陣列
    const items = body.assets || (body.imageUrls?.map((url, idx) => ({
      imageUrl: url,
      title: `image-${idx}`,
      id: `img-${idx}-${Date.now()}`,
    })));

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No images to export" },
        { status: 400 }
      );
    }

    if (items.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 images per export" },
        { status: 400 }
      );
    }

    console.log(`[Gift Box Radar] Exporting ${items.length} images`);

    const results: { id: string; success: boolean; url?: string; error?: string }[] = [];

    for (const item of items) {
      try {
        // 下載原始圖片
        const imageBuffer = await downloadImage(item.imageUrl);
        
        // 生成唯一檔名
        const timestamp = Date.now();
        const safeTitle = item.title
          .replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "_")
          .slice(0, 50);
        const filename = `${safeTitle}_${timestamp}`;

        // 處理並上傳
        const { url } = await processImage(imageBuffer, filename);

        results.push({
          id: item.id,
          success: true,
          url,
        });
      } catch (error: any) {
        console.error(`[Gift Box Radar] Export error for ${item.id}:`, error.message);
        results.push({
          id: item.id,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`[Gift Box Radar] Export complete: ${successCount}/${items.length} successful`);

    return NextResponse.json({
      success: true,
      total: items.length,
      successCount,
      failCount: items.length - successCount,
      results,
    });
  } catch (error: any) {
    console.error("[Gift Box Radar] Export error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
