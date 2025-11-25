import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - 列出所有相簿
export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      include: {
        coverImage: true,
        items: {
          include: { image: true },
          orderBy: { position: "asc" },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ albums });
  } catch (error) {
    console.error("GET /api/admin/albums error:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

// POST - 建立新相簿
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received album creation request:", body);
    
    const { name, description, effect, images } = body;

    if (!name || !images || images.length === 0) {
      console.error("Validation failed:", { name, images });
      return NextResponse.json(
        { error: "Name and images are required" },
        { status: 400 }
      );
    }

    // 生成 slug（使用時間戳避免重複）
    const timestamp = Date.now();
    const slug = `${name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]/g, "")}-${timestamp}`;

    console.log("Creating album with slug:", slug);

    // 確保所有圖片的 Image 記錄存在，不存在則建立
    const imageIds = images.map((img: { imageId: string }) => img.imageId);
    
    // 檢查哪些圖片已存在
    const existingImages = await prisma.image.findMany({
      where: { storageKey: { in: imageIds } }, // imageId 實際上是 storageKey (R2 key)
      select: { id: true, storageKey: true },
    });
    
    const existingKeyToId = new Map(existingImages.map(img => [img.storageKey, img.id]));
    
    // 為不存在的圖片建立 Image 記錄
    const newImagePromises = imageIds
      .filter((key: string) => !existingKeyToId.has(key))
      .map(async (key: string) => {
        const url = `https://img.mbpack.co/${key}`; // R2 public URL
        const image = await prisma.image.create({
          data: {
            url,
            storageKey: key,
          },
        });
        existingKeyToId.set(key, image.id);
        return image;
      });
    
    if (newImagePromises.length > 0) {
      console.log(`Creating ${newImagePromises.length} new Image records...`);
      await Promise.all(newImagePromises);
    }

    // 將 storageKey 轉換為實際的 Image ID
    const imageRecords = images.map((img: { imageId: string; position: number }) => ({
      imageId: existingKeyToId.get(img.imageId)!,
      position: img.position,
    }));

    // 建立相簿與圖片關聯（先不設定 coverImageId）
    const album = await prisma.album.create({
      data: {
        slug,
        name,
        description: description || null,
        items: {
          create: imageRecords,
        },
      },
      include: {
        items: {
          include: { image: true },
          orderBy: { position: "asc" },
        },
        _count: { select: { items: true } },
      },
    });

    // 更新封面圖片（使用第一張圖）
    const coverImageId = existingKeyToId.get(images[0]?.imageId);
    if (coverImageId) {
      await prisma.album.update({
        where: { id: album.id },
        data: { coverImageId },
      });
    }
    
    // 重新查詢包含 coverImage
    const finalAlbum = await prisma.album.findUnique({
      where: { id: album.id },
      include: {
        coverImage: true,
        items: {
          include: { image: true },
          orderBy: { position: "asc" },
        },
        _count: { select: { items: true } },
      },
    });

    console.log("Album created successfully:", finalAlbum?.id);

    return NextResponse.json({
      ok: true,
      album: finalAlbum,
      message: `Album "${name}" created successfully`,
    });
  } catch (error: any) {
    console.error("POST /api/admin/albums error:", error);
    console.error("Error details:", error?.message, error?.stack);
    return NextResponse.json(
      { 
        error: "Failed to create album",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
