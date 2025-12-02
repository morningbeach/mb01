// app/api/nav/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// 伺服器端快取 5 分鐘
export const revalidate = 300;

export async function GET() {
  try {
    const pages = await prisma.sitePage.findMany({
      where: {
        isEnabled: true,
        showInNav: true,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        slug: true,
        navLabel_zh: true,
        navLabel_en: true,
        order: true,
      },
    });

    // Ensure 'about' page is always present in navigation
    // This is a fallback in case the database record is missing or disabled
    const hasAbout = pages.some(p => p.slug === 'about');
    if (!hasAbout) {
      pages.push({
        slug: 'about',
        navLabel_zh: '關於我們',
        navLabel_en: 'About',
        order: 20, // Default order for About page
      });
      
      // Re-sort by order to ensure correct position
      pages.sort((a, b) => a.order - b.order);
    }

    // 設置快取 header，讓瀏覽器可以快取結果
    return NextResponse.json(pages, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching nav items:", error);
    return NextResponse.json([], { status: 500 });
  }
}
