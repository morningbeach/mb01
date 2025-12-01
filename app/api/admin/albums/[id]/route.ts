import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

// GET - 取得單一相簿
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        coverImage: true,
        items: {
          include: { image: true },
          orderBy: { position: "asc" },
        },
        _count: { select: { items: true } },
      },
    });

    if (!album) {
      return NextResponse.json(
        { error: "Album not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ album });
  } catch (error) {
    console.error("GET album error:", error);
    return NextResponse.json(
      { error: "Failed to fetch album" },
      { status: 500 }
    );
  }
}

// PUT - 更新相簿圖片排序與基本資訊
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { images, name, description } = body;

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Images payload is required" },
        { status: 400 }
      );
    }

    const album = await prisma.album.findUnique({ where: { id } });
    if (!album) {
      return NextResponse.json(
        { error: "Album not found" },
        { status: 404 }
      );
    }

    const normalizedImages: { storageKey: string; position: number }[] = [];
    const seen = new Set<string>();
    images.forEach((img: any) => {
      if (!img?.imageId || seen.has(img.imageId)) return;
      seen.add(img.imageId);
      normalizedImages.push({
        storageKey: img.imageId,
        position:
          typeof img.position === "number"
            ? img.position
            : normalizedImages.length,
      });
    });

    if (normalizedImages.length === 0) {
      return NextResponse.json(
        { error: "No valid images provided" },
        { status: 400 }
      );
    }

    const storageKeys = normalizedImages.map((img) => img.storageKey);

    // 確保 Image 記錄存在
    const existingImages = await prisma.image.findMany({
      where: { storageKey: { in: storageKeys } },
      select: { id: true, storageKey: true },
    });

    const keyToId = new Map(existingImages.map((img) => [img.storageKey, img.id]));
    const missingKeys = storageKeys.filter((key) => !keyToId.has(key));

    if (missingKeys.length > 0) {
      const created = await Promise.all(
        missingKeys.map((key) =>
          prisma.image.create({
            data: {
              storageKey: key,
              url: `https://img.mbpack.co/${key}`,
            },
            select: { id: true, storageKey: true },
          })
        )
      );
      created.forEach((img) => keyToId.set(img.storageKey, img.id));
    }

    const imageRecords = normalizedImages.map((img) => ({
      albumId: id,
      imageId: keyToId.get(img.storageKey)!,
      position: img.position,
    }));

    await prisma.$transaction([
      prisma.albumImage.deleteMany({ where: { albumId: id } }),
      prisma.albumImage.createMany({ data: imageRecords }),
      prisma.album.update({
        where: { id },
        data: {
          name: name ?? undefined,
          description: description ?? undefined,
          coverImageId:
            normalizedImages.length > 0
              ? keyToId.get(normalizedImages[0].storageKey) ?? undefined
              : undefined,
          updatedAt: new Date(),
        },
      }),
    ]);

    const updatedAlbum = await prisma.album.findUnique({
      where: { id },
      include: {
        coverImage: true,
        items: {
          include: { image: true },
          orderBy: { position: "asc" },
        },
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json({ album: updatedAlbum });
  } catch (error) {
    console.error("PUT album error:", error);
    return NextResponse.json(
      { error: "Failed to update album" },
      { status: 500 }
    );
  }
}
