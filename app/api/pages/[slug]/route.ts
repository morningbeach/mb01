// app/api/pages/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const page = await prisma.sitePage.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // 只返回已啟用的頁面（或在開發環境中返回所有頁面）
    if (!page.isEnabled && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: page.id,
      slug: page.slug,
      type: page.type,
      navLabel_zh: page.navLabel_zh,
      navLabel_en: page.navLabel_en,
      label_zh: page.label_zh,
      label_en: page.label_en,
      title_zh: page.title_zh,
      title_en: page.title_en,
      desc_zh: page.desc_zh,
      desc_en: page.desc_en,
      showInNav: page.showInNav,
      isEnabled: page.isEnabled,
      pageData: page.pageData,
    });
  } catch (error) {
    console.error("[API /pages/[slug]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
