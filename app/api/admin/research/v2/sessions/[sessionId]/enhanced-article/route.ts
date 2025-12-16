// app/api/admin/research/v2/sessions/[sessionId]/enhanced-article/route.ts
// 增強版文章生成 API - 支援視覺化、嚴格引用、自動配圖

import { NextRequest, NextResponse } from 'next/server';
import { enhancedArticleGenerator, EnhancedArticleOptions } from '@/lib/research/writing/enhanced-article-generator';
import { prisma } from '@/lib/prisma';

// 生成增強版文章
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();

    const {
      moduleIds,
      articleType = 'trend',
      title,
      enableVisualization = true,
      enableStrictCitations = true,
      enableAutoImages = true,
      imageStyle = 'professional',
      citationStyle = 'inline'
    } = body;

    // 驗證 session
    const session = await prisma.researchSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json({ error: '找不到研究會話' }, { status: 404 });
    }

    // 如果沒提供 moduleIds，使用該 session 的所有模組
    let finalModuleIds = moduleIds;
    if (!finalModuleIds || finalModuleIds.length === 0) {
      const modules = await prisma.researchModule.findMany({
        where: { sessionId },
        select: { id: true }
      });
      finalModuleIds = modules.map(m => m.id);
    }

    if (finalModuleIds.length === 0) {
      return NextResponse.json({ error: '沒有可用的研究模組' }, { status: 400 });
    }

    // 生成增強版文章
    const article = await enhancedArticleGenerator.generate({
      sessionId,
      moduleIds: finalModuleIds,
      articleType,
      title,
      enableVisualization,
      enableStrictCitations,
      enableAutoImages,
      imageStyle,
      citationStyle
    } as EnhancedArticleOptions);

    // 儲存草稿
    const draft = await prisma.articleDraft.create({
      data: {
        sessionId,
        title_zh: article.title_zh,
        content_zh: article.fullMarkdown, // 使用包含所有標記的完整版
        excerpt_zh: article.excerpt_zh,
        status: 'DRAFT',
        wordCount: article.wordCount,
        outline: {
          enhanced: true,
          options: {
            enableVisualization,
            enableStrictCitations,
            enableAutoImages,
            imageStyle,
            citationStyle
          },
          citationCount: article.citations.length,
          visualizationCount: article.visualizations.length,
          imageCount: article.images.length,
          tags: article.tags
        }
      }
    });

    return NextResponse.json({
      success: true,
      draft: {
        id: draft.id,
        title_zh: draft.title_zh,
        excerpt_zh: draft.excerpt_zh,
        wordCount: article.wordCount
      },
      article: {
        ...article,
        // 不要在 response 中返回完整內容，避免過大
        content_zh: undefined,
        fullMarkdown: undefined
      },
      stats: {
        citations: article.citations.length,
        visualizations: article.visualizations.length,
        images: article.images.length,
        wordCount: article.wordCount,
        uniqueSources: new Set(article.citations.map(c => c.sourceId)).size
      }
    });

  } catch (error) {
    console.error('Enhanced article generation error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '文章生成失敗'
    }, { status: 500 });
  }
}

// 獲取增強版文章預覽
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get('draftId');

    if (!draftId) {
      // 返回該 session 的所有增強版草稿
      const drafts = await prisma.articleDraft.findMany({
        where: {
          sessionId
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title_zh: true,
          excerpt_zh: true,
          status: true,
          createdAt: true,
          outline: true
        }
      });
      
      // 過濾只有增強版的草稿
      const enhancedDrafts = drafts.filter(d => {
        const outline = d.outline as any;
        return outline?.enhanced === true;
      });

      return NextResponse.json({ drafts: enhancedDrafts });
    }

    // 返回特定草稿
    const draft = await prisma.articleDraft.findUnique({
      where: { id: draftId }
    });

    if (!draft || draft.sessionId !== sessionId) {
      return NextResponse.json({ error: '找不到草稿' }, { status: 404 });
    }

    return NextResponse.json({ draft });

  } catch (error) {
    console.error('Get enhanced article error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '獲取文章失敗'
    }, { status: 500 });
  }
}
