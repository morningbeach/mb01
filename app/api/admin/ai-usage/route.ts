// app/api/admin/ai-usage/route.ts
// 管理後台 - AI 使用統計
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 取得 UTC+8 的今日開始時間
function getTodayStartUTC8(): Date {
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const todayStr = utc8.toISOString().split("T")[0];
  return new Date(todayStr + "T00:00:00+08:00");
}

// 取得過去 N 天的日期範圍
function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");
    
    const { start, end } = getDateRange(days);
    const todayStart = getTodayStartUTC8();
    
    // 並行查詢
    const [
      totalUsage,
      todayUsage,
      uniqueIPs,
      usageByDate,
      topProducts,
      recentLogs,
      inquiries,
    ] = await Promise.all([
      // 總使用次數
      prisma.aiUsageLog.count(),
      
      // 今日使用次數
      prisma.aiUsageLog.count({
        where: {
          createdAt: { gte: todayStart },
        },
      }),
      
      // 不重複 IP 數
      prisma.aiUsageLog.groupBy({
        by: ["ipAddress"],
        where: {
          createdAt: { gte: start },
        },
      }),
      
      // 每日使用量（過去 N 天）
      prisma.$queryRaw`
        SELECT 
          DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Taipei') as date,
          COUNT(*) as count
        FROM "AiUsageLog"
        WHERE created_at >= ${start}
        GROUP BY DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Taipei')
        ORDER BY date DESC
      `,
      
      // 熱門產品
      prisma.aiUsageLog.groupBy({
        by: ["productSlug"],
        _count: { productSlug: true },
        where: {
          productSlug: { not: null },
          createdAt: { gte: start },
        },
        orderBy: { _count: { productSlug: "desc" } },
        take: 10,
      }),
      
      // 最近使用記錄
      prisma.aiUsageLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              name_zh: true,
              slug: true,
            },
          },
        },
      }),
      
      // 詢價記錄
      prisma.aiInquiry.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
    ]);
    
    return NextResponse.json({
      success: true,
      stats: {
        totalUsage,
        todayUsage,
        uniqueIPCount: uniqueIPs.length,
        usageByDate,
        topProducts: topProducts.map((p) => ({
          slug: p.productSlug,
          count: p._count.productSlug,
        })),
      },
      recentLogs: recentLogs.map((log) => ({
        id: log.id,
        ip: log.ipAddress,
        product: log.product?.name_zh || log.productSlug,
        productSlug: log.productSlug,
        prompt: log.prompt,
        resultUrl: log.resultUrl,
        shareToken: log.shareToken,
        createdAt: log.createdAt,
      })),
      inquiries: inquiries.map((inq) => ({
        id: inq.id,
        email: inq.email,
        ip: inq.ipAddress,
        message: inq.message,
        createdAt: inq.createdAt,
      })),
    });
    
  } catch (error: any) {
    console.error("[Admin AI Usage] GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
