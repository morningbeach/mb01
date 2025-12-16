// app/api/admin/research/sessions/route.ts
// 研究任務 API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { researchEngine } from '@/lib/research';

export const maxDuration = 180; // 需要較長時間來完成自動分析

// GET: 獲取研究任務列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [sessions, total] = await Promise.all([
      prisma.researchSession.findMany({
        where,
        include: {
          _count: {
            select: {
              modules: true,
              sources: true,
              conversations: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.researchSession.count({ where })
    ]);

    return NextResponse.json({
      sessions,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching research sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research sessions' },
      { status: 500 }
    );
  }
}

// POST: 建立新研究任務
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const session = await prisma.researchSession.create({
      data: {
        status: 'COLLECTING',
        focusAreas: body.focusAreas || ['TREND'],
        languages: body.languages || ['zh', 'en'],
        regions: body.regions || ['global'],
        triggerType: 'manual'
      }
    });

    // 如果 autoAnalyze 為 true，自動執行收集和分析
    if (body.autoAnalyze) {
      try {
        // Step 1: 收集資料
        console.log(`[Research API] Auto collecting for session: ${session.id}`);
        await researchEngine.collectSources(session.id);
        
        // Step 2: 生成模組
        console.log(`[Research API] Auto analyzing for session: ${session.id}`);
        await researchEngine.generateModules(session.id);
        
        // 獲取更新後的 session
        const updatedSession = await prisma.researchSession.findUnique({
          where: { id: session.id },
          include: {
            _count: {
              select: { modules: true, sources: true }
            }
          }
        });
        
        return NextResponse.json({ 
          session: updatedSession,
          autoAnalyzed: true 
        });
      } catch (analyzeError) {
        console.error('[Research API] Auto analyze error:', analyzeError);
        // 即使自動分析失敗，也返回建立的 session
        return NextResponse.json({ 
          session,
          autoAnalyzed: false,
          error: String(analyzeError)
        });
      }
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error creating research session:', error);
    return NextResponse.json(
      { error: 'Failed to create research session' },
      { status: 500 }
    );
  }
}
