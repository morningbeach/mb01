// app/api/admin/research/drafts/route.ts
// 文章草稿 API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 120;

// GET: 獲取草稿列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    if (sessionId) where.sessionId = sessionId;
    if (status) where.status = status;

    const [drafts, total] = await Promise.all([
      prisma.articleDraft.findMany({
        where,
        include: {
          moduleUsages: {
            include: {
              module: {
                select: {
                  id: true,
                  title_zh: true,
                  moduleType: true
                }
              }
            }
          },
          session: {
            select: {
              id: true,
              focusAreas: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.articleDraft.count({ where })
    ]);

    return NextResponse.json({
      drafts,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

// POST: 建立新草稿
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const draft = await prisma.articleDraft.create({
      data: {
        sessionId: body.sessionId,
        title_zh: body.title || '新草稿',
        title_en: '',
        content_zh: '',
        content_en: '',
        status: 'DRAFT'
      }
    });

    // 如果有選擇模組，建立關聯
    if (body.moduleIds && body.moduleIds.length > 0) {
      await prisma.articleModuleUsage.createMany({
        data: body.moduleIds.map((moduleId: string, index: number) => ({
          articleId: draft.id,
          moduleId,
          usageType: 'reference',
          position: index
        }))
      });
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Error creating draft:', error);
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    );
  }
}
