// app/api/admin/research/v2/sessions/[sessionId]/scrape/route.ts
// 抓取 API - 只抓取選定的連結

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scraperEngine } from '@/lib/research/engines/scraper-engine';
import { analysisEngine } from '@/lib/research/engines/analysis-engine';
import { calculateCitationScore } from '@/lib/research/core/citation-scorer';
import { researchLogger } from '@/lib/research/core/research-logger';

export const maxDuration = 300;

// POST: 抓取並分析選定的 URL
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  let logId: string | null = null;
  
  try {
    const { sessionId } = params;
    const body = await request.json();
    const { selectedUrls } = body;

    if (!selectedUrls || !Array.isArray(selectedUrls) || selectedUrls.length === 0) {
      return NextResponse.json(
        { error: 'No URLs selected' },
        { status: 400 }
      );
    }

    // 獲取 session
    const session = await prisma.researchSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // 開始記錄抓取操作
    logId = await researchLogger.start({
      sessionId,
      action: 'scrape_start',
      input: {
        urlCount: selectedUrls.length,
        urls: selectedUrls.slice(0, 5).map((u: any) => typeof u === 'string' ? u : u.url)
      }
    });

    // 更新狀態
    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { status: 'COLLECTING' }
    });

    const results = {
      scraped: 0,
      analyzed: 0,
      failed: 0,
      sources: [] as any[]
    };

    // 逐一抓取和分析
    for (const urlInfo of selectedUrls) {
      try {
        const url = typeof urlInfo === 'string' ? urlInfo : urlInfo.url;
        
        // 抓取內容
        const scraped = await scraperEngine.scrape(url, {
          timeout: 30000,
          maxLength: 30000
        });

        if (!scraped.success || !scraped.content) {
          results.failed++;
          continue;
        }

        results.scraped++;

        // AI 分析
        const analysis = await analysisEngine.analyzeSource(
          scraped,
          session.topic || '',
          session.focusAreas || []
        );

        // 儲存到資料庫
        const source = await prisma.researchSource.create({
          data: {
            sessionId,
            url: analysis.url,
            title: analysis.title || scraped.title,
            domain: new URL(url).hostname,
            language: analysis.language || scraped.language,
            region: analysis.region || 'unknown',
            authorityScore: analysis.authorityScore,
            originalityScore: analysis.originalityScore,
            relevanceScore: analysis.relevanceScore,
            sourceType: analysis.sourceType as any,
            summary: analysis.summary,
            keyPoints: analysis.keyPoints || [],
            isVerified: false,
            isExcluded: analysis.isMarketing || analysis.authorityScore < 40
          }
        });

        results.analyzed++;
        results.sources.push({
          id: source.id,
          title: source.title,
          authorityScore: source.authorityScore,
          relevanceScore: source.relevanceScore
        });

      } catch (urlError: any) {
        console.error(`Error processing ${typeof urlInfo === 'string' ? urlInfo : urlInfo.url}:`, urlError.message);
        results.failed++;
      }
    }

    // 更新 session 狀態
    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { 
        status: results.analyzed > 0 ? 'ANALYZING' : 'COLLECTING'
      }
    });

    // 完成日誌記錄
    if (logId) {
      await researchLogger.complete(logId, {
        output: {
          scraped: results.scraped,
          analyzed: results.analyzed,
          failed: results.failed
        }
      });
    }

    return NextResponse.json({
      success: true,
      results,
      message: `成功抓取 ${results.scraped} 個，分析 ${results.analyzed} 個，失敗 ${results.failed} 個`
    });

  } catch (error: any) {
    console.error('Scrape error:', error);
    
    // 記錄錯誤日誌
    if (logId) {
      await researchLogger.error(logId, error.message || 'Scrape failed');
    }
    
    return NextResponse.json(
      { error: error.message || 'Scrape failed' },
      { status: 500 }
    );
  }
}
