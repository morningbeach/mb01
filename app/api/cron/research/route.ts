// app/api/cron/research/route.ts
// Vercel Cron Job - 自動研究任務

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 300; // 5 分鐘
export const dynamic = 'force-dynamic';

// 驗證 Cron Secret
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

// GET: 執行自動研究任務
export async function GET(request: NextRequest) {
  // 驗證請求來源
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('[Cron] Starting automated research task...');

    // 檢查是否有待處理的研究任務
    const pendingSessions = await prisma.researchSession.findMany({
      where: {
        status: 'COLLECTING'
      },
      take: 3,
      orderBy: { createdAt: 'asc' }
    });

    const results: { sessionId: string; status: string; error?: string }[] = [];

    for (const session of pendingSessions) {
      try {
        // 更新狀態為分析中
        await prisma.researchSession.update({
          where: { id: session.id },
          data: { status: 'ANALYZING' }
        });

        // 這裡可以加入實際的研究邏輯
        // 目前只是更新狀態

        await prisma.researchSession.update({
          where: { id: session.id },
          data: { status: 'PENDING_REVIEW' }
        });

        results.push({
          sessionId: session.id,
          status: 'completed'
        });

      } catch (error) {
        console.error(`[Cron] Error processing session ${session.id}:`, error);
        
        results.push({
          sessionId: session.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // 檢查排程
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // 每週一/三/五自動建立研究任務
    if ([1, 3, 5].includes(dayOfWeek)) {
      const topics: Record<number, { focusAreas: string[] }> = {
        1: { focusAreas: ['SUSTAINABILITY', 'TREND'] },
        3: { focusAreas: ['MATERIAL', 'INNOVATION'] },
        5: { focusAreas: ['MARKET_INSIGHT', 'TREND'] }
      };

      const config = topics[dayOfWeek];
      
      const newSession = await prisma.researchSession.create({
        data: {
          status: 'COLLECTING',
          focusAreas: config.focusAreas,
          languages: ['zh', 'en'],
          regions: ['global', 'asia'],
          triggerType: 'scheduled'
        }
      });

      results.push({
        sessionId: newSession.id,
        status: 'created'
      });
    }

    console.log(`[Cron] Research task completed. Processed ${results.length} sessions.`);

    return NextResponse.json({
      success: true,
      processedSessions: results.length,
      results
    });

  } catch (error) {
    console.error('[Cron] Research cron job failed:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
