// app/api/admin/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - 取得所有 Blog 文章
export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      include: {
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error("取得 Blog 列表失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "取得列表失敗" },
      { status: 500 }
    );
  }
}

// POST - 建立新 Blog 文章
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tagIds, ...postData } = body;

    // 驗證必填欄位
    if (!postData.slug || !postData.title) {
      return NextResponse.json(
        { success: false, message: "slug 和 title 為必填" },
        { status: 400 }
      );
    }

    // 檢查 slug 是否重複
    const existing = await prisma.blogPost.findUnique({
      where: { slug: postData.slug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `slug "${postData.slug}" 已被使用` },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        ...postData,
        // 建立 TAG 關聯
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
    console.error("建立 Blog 失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "建立失敗" },
      { status: 500 }
    );
  }
}
