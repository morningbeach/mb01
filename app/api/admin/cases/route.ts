// app/api/admin/cases/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET: 取得所有案例
export async function GET() {
  try {
    const cases = await prisma.caseProject.findMany({
      orderBy: [
        { isFeatured: "desc" },
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });
    return NextResponse.json(cases);
  } catch (error) {
    console.error("Failed to fetch cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}

// POST: 建立新案例
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // 產生唯一 slug
    let slug = data.slug?.trim();
    if (!slug) {
      slug = data.title_zh
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // 確保 slug 唯一
    const existing = await prisma.caseProject.findUnique({
      where: { slug },
    });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const newCase = await prisma.caseProject.create({
      data: {
        slug,
        title_zh: data.title_zh,
        title_en: data.title_en || null,
        desc_zh: data.desc_zh || null,
        desc_en: data.desc_en || null,
        client_zh: data.client_zh || null,
        client_en: data.client_en || null,
        category_zh: data.category_zh || null,
        category_en: data.category_en || null,
        year: data.year || null,
        coverImage: data.coverImage || null,
        images: data.images || [],
        isPublished: data.isPublished || false,
        isFeatured: data.isFeatured || false,
        order: data.order || 0,
      },
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error("Failed to create case:", error);
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 }
    );
  }
}
