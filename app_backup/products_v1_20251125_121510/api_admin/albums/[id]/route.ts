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
