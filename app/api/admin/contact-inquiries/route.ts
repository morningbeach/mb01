// app/api/admin/contact-inquiries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // 建立查詢條件
    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    // 查詢資料
    const [inquiries, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contactInquiry.count({ where }),
    ]);

    // 統計各狀態數量
    const stats = await prisma.contactInquiry.groupBy({
      by: ["status"],
      _count: true,
    });

    const statusCounts = stats.reduce((acc: any, stat: any) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: statusCounts,
    });
  } catch (error: any) {
    console.error("[Get Inquiries Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}
