// app/api/cases/route.ts - 公開 API，不需要認證
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET: 取得已發布的案例（公開）
export async function GET() {
  try {
    const cases = await prisma.caseProject.findMany({
      where: {
        isPublished: true,
      },
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
