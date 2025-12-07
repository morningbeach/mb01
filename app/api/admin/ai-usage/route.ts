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
    
    // 並行查詢（減少查詢數量以避免連線過多）
    const [
      totalUsage,
      todayUsage,
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
      
      // 最近使用記錄（包含日期範圍內的記錄用於統計）
      prisma.aiUsageLog.findMany({
        where: { createdAt: { gte: start } },
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
    
    // 從 recentLogs 計算統計數據
    const uniqueIPs = new Set(recentLogs.map(log => log.ipAddress));
    
    // 依日期分組
    const dateCount: Record<string, number> = {};
    recentLogs.forEach((log) => {
      const date = log.createdAt.toISOString().split("T")[0];
      dateCount[date] = (dateCount[date] || 0) + 1;
    });
    
    const usageByDate = Object.entries(dateCount)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));
    
    // 熱門產品統計
    const productCount: Record<string, number> = {};
    recentLogs.forEach((log) => {
      if (log.productSlug) {
        productCount[log.productSlug] = (productCount[log.productSlug] || 0) + 1;
      }
    });
    
    const topProducts = Object.entries(productCount)
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    console.log("[Admin AI Usage] Stats loaded successfully");
    
    return NextResponse.json({
      success: true,
      stats: {
        totalUsage,
        todayUsage,
        uniqueIPCount: uniqueIPs.size,
        usageByDate,
        topProducts,
      },
      recentLogs: recentLogs.slice(0, 20).map((log) => ({
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
