// app/api/nav/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

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
      },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching nav items:", error);
    return NextResponse.json([], { status: 500 });
  }
}
