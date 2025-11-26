// app/api/admin/blog/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - 取得單一 Blog 文章
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: params.id },
      include: {
        tags: { include: { tag: true } },
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, message: "文章不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error("取得 Blog 失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "取得失敗" },
      { status: 500 }
    );
  }
}

// PUT - 更新 Blog 文章
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { tagIds, id, createdAt, updatedAt, tags, ...updateData } = body;

    // 檢查 slug 是否與其他文章重複
    if (updateData.slug) {
      const existing = await prisma.blogPost.findFirst({
        where: {
          slug: updateData.slug,
          NOT: { id: params.id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { success: false, message: `slug "${updateData.slug}" 已被其他文章使用` },
          { status: 400 }
        );
      }
    }

    // 先刪除舊的 TAG 關聯
    await prisma.blogTag.deleteMany({
      where: { blogPostId: params.id },
    });

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        ...updateData,
        // 重新建立 TAG 關聯
        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId: string) => ({ tagId })),
            }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error("更新 Blog 失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "更新失敗" },
      { status: 500 }
    );
  }
}

// DELETE - 刪除 Blog 文章
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 先刪除 TAG 關聯
    await prisma.blogTag.deleteMany({
      where: { blogPostId: params.id },
    });

    await prisma.blogPost.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "文章已刪除" });
  } catch (error: any) {
    console.error("刪除 Blog 失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "刪除失敗" },
      { status: 500 }
    );
  }
}
