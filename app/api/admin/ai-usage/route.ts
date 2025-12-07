// app/api/admin/ai-usage/route.ts
// 管理後台 - AI 使用統計
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 強制使用 Node.js runtime（不使用 Edge）
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    
    console.log("[Admin AI Usage] Fetching stats for days:", days);
    
    // 並行查詢
    const [
      totalUsage,
      todayUsage,
      uniqueIPs,
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
    
    // 簡化的每日統計 - 從最近的記錄中計算
    const allLogs = await prisma.aiUsageLog.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    
    // 依日期分組
    const dateCount: Record<string, number> = {};
    allLogs.forEach((log) => {
      const date = log.createdAt.toISOString().split("T")[0];
      dateCount[date] = (dateCount[date] || 0) + 1;
    });
    
    const usageByDate = Object.entries(dateCount)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));
    
    console.log("[Admin AI Usage] Stats loaded successfully");
    
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
