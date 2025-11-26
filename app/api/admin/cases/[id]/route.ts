// app/api/admin/cases/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET: 取得單一案例
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseProject = await prisma.caseProject.findUnique({
      where: { id: params.id },
    });

    if (!caseProject) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(caseProject);
  } catch (error) {
    console.error("Failed to fetch case:", error);
    return NextResponse.json(
      { error: "Failed to fetch case" },
      { status: 500 }
    );
  }
}

// PUT: 更新案例
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();

    // 檢查案例是否存在
    const existing = await prisma.caseProject.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    // 如果 slug 變更，確保唯一
    let slug = data.slug?.trim() || existing.slug;
    if (slug !== existing.slug) {
      const slugExists = await prisma.caseProject.findFirst({
        where: {
          slug,
          id: { not: params.id },
        },
      });
      if (slugExists) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updated = await prisma.caseProject.update({
      where: { id: params.id },
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update case:", error);
    return NextResponse.json(
      { error: "Failed to update case" },
      { status: 500 }
    );
  }
}

// DELETE: 刪除案例
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.caseProject.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete case:", error);
    return NextResponse.json(
      { error: "Failed to delete case" },
      { status: 500 }
    );
  }
}
