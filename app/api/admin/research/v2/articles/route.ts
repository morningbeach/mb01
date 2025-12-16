// app/api/admin/research/v2/articles/route.ts
// 文章生成 API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { articleGenerator } from '@/lib/research/writing/article-generator';

export const maxDuration = 180;

// GET: 獲取草稿列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (sessionId) where.sessionId = sessionId;
    if (status) where.status = status;

    const drafts = await prisma.articleDraft.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        session: {
          select: { id: true, focusAreas: true }
        },
        moduleUsages: {
          include: {
            module: {
              select: { title_zh: true, moduleType: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ drafts });
  } catch (error: any) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

// POST: 生成新文章（支援分步驟：outline -> generate）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      moduleIds,
      articleType = 'trend',
      style = 'mbpack',
      action = 'generate', // 'outline' | 'generate'
      title,
      outline,
      customInstructions,
      language = 'zh',
      saveDraft = true
    } = body;

    if (!sessionId || !moduleIds || moduleIds.length === 0) {
      return NextResponse.json(
        { error: 'sessionId and moduleIds are required' },
        { status: 400 }
      );
    }

    // Step 1: Generate outline only
    if (action === 'outline') {
      const outlineResult = await articleGenerator.generateOutline(
        sessionId,
        moduleIds,
        {
          articleType,
          style,
          title: title || undefined
        }
      );
      
      return NextResponse.json({
        success: true,
        outline: outlineResult
      });
    }

    // Step 2: Generate full article
    const article = await articleGenerator.generateArticle({
      sessionId,
      moduleIds,
      articleType,
      style,
      customTitle: title,
      customInstructions,
      outline,
      generateBilingual: language === 'both'
    });

    // 儲存草稿
    let savedArticle: { id: string } | undefined;
    if (saveDraft) {
      const draftId = await articleGenerator.saveDraft(sessionId, article);
      savedArticle = { id: draftId };
    }

    return NextResponse.json({
      success: true,
      article: savedArticle ? { 
        id: savedArticle.id,
        title_zh: article.title_zh,
        content_zh: article.content_zh,
        metaDescription_zh: article.metaDescription_zh,
        status: 'draft'
      } : article
    });
  } catch (error: any) {
    console.error('Error generating article:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate article' },
      { status: 500 }
    );
  }
}
