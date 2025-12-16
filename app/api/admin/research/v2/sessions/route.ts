// app/api/admin/research/v2/sessions/route.ts
// 研究任務 API v2 - 使用新架構

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { researchService } from '@/lib/research/core/research-service';

export const maxDuration = 300; // 5 分鐘超時

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
              conversations: true,
              articles: true
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

// POST: 建立新研究任務並執行研究
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      topic,
      focusAreas = ['TREND'],
      languages = ['zh', 'en'],
      regions = ['tw', 'global'],
      depth = 'standard',
      additionalUrls = [],
      autoResearch = true,
      // 市場設定
      marketType = 'all',
      targetAudience = [],
      industryTags = []
    } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // 建立研究任務
    const sessionId = await researchService.createSession({
      topic,
      focusAreas,
      languages,
      regions,
      depth,
      additionalUrls,
      marketType,
      targetAudience,
      industryTags
    });

    // 如果 autoResearch，自動執行完整研究流程
    if (autoResearch) {
      try {
        const result = await researchService.executeResearch(sessionId, {
          topic,
          focusAreas,
          languages,
          regions,
          depth,
          additionalUrls
        });

        return NextResponse.json({
          success: true,
          session: {
            id: sessionId,
            topic,
            status: result.status
          },
          result
        });
      } catch (researchError: any) {
        console.error('[Research API v2] Research error:', researchError);
        
        // 返回 session，即使研究失敗
        const session = await prisma.researchSession.findUnique({
          where: { id: sessionId },
          include: { _count: { select: { modules: true, sources: true } } }
        });

        return NextResponse.json({
          success: false,
          session,
          error: researchError.message
        });
      }
    }

    // 不自動研究，只返回 session
    const session = await prisma.researchSession.findUnique({
      where: { id: sessionId }
    });

    return NextResponse.json({
      success: true,
      session
    });

  } catch (error: any) {
    console.error('Error creating research session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create research session' },
      { status: 500 }
    );
  }
}
