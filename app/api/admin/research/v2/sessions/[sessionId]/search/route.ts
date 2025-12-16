// app/api/admin/research/v2/sessions/[sessionId]/search/route.ts
// 搜尋 API - 只執行搜尋，返回連結列表供用戶選擇

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchEngine } from '@/lib/research/engines/search-engine';
import { researchLogger } from '@/lib/research/core/research-logger';
import { defaultPrompts, promptToSearchQueries } from '@/lib/research/prompts/deep-research-prompts';

export const maxDuration = 60;

// POST: 執行搜尋並返回連結列表
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  let logId: string | null = null;
  
  try {
    const { sessionId } = params;
    
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

    // 開始記錄搜尋操作
    logId = await researchLogger.start({
      sessionId,
      action: 'search_start',
      input: {
        topic: session.topic,
        marketType: session.marketType,
        targetAudience: session.targetAudience,
        industryTags: session.industryTags,
        researchPromptId: session.researchPromptId
      }
    });

    // 更新狀態
    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { status: 'COLLECTING' }
    });

    // 如果有深度研究提示，擴展搜尋查詢
    let additionalQueries: string[] = [];
    if (session.researchPromptId) {
      const prompt = defaultPrompts.find(p => p.id === session.researchPromptId);
      if (prompt) {
        additionalQueries = promptToSearchQueries(prompt, session.topic || '');
      }
    }

    // 執行搜尋 - 使用市場類型和產業篩選
    const searchResults = await searchEngine.searchPackaging(
      session.topic || '',
      {
        regions: session.regions || ['tw', 'global'],
        languages: session.languages || ['zh', 'en'],
        focusAreas: session.focusAreas || ['TREND'],
        timeRange: 'year',
        // 新增：市場類型篩選
        marketType: (session.marketType as 'all' | 'consumer' | 'b2b' | 'design') || 'all',
        targetAudience: session.targetAudience || [],
        industryTags: session.industryTags || []
      }
    );

    // 如果有額外查詢，執行補充搜尋
    let promptResults: any[] = [];
    if (additionalQueries.length > 0) {
      promptResults = await searchEngine.multiSearch(additionalQueries.slice(0, 5), {
        gl: 'tw',
        hl: 'zh-TW',
        num: 5
      });
    }

    // 合併並去重結果
    const allResults = [...searchResults, ...promptResults];
    const seenUrls = new Set<string>();
    const uniqueResults = allResults.filter(r => {
      if (seenUrls.has(r.url)) return false;
      seenUrls.add(r.url);
      return true;
    });

    // 為每個結果添加預估分數和元資料
    const enrichedResults = uniqueResults.map((result, index) => ({
      id: `search-${index}`,
      url: result.url,
      title: result.title,
      snippet: result.snippet,
      domain: new URL(result.url).hostname,
      estimatedScore: estimateSourceScore(result),
      sourceType: guessSourceType(result.url, result.title),
      selected: true,  // 預設全選
      position: index + 1
    }));

    // 儲存搜尋結果到 session
    await prisma.researchSession.update({
      where: { id: sessionId },
      data: {
        status: 'COLLECTING',  // 使用 COLLECTING 狀態表示等待選擇
        // 暫存搜尋結果
        humanNotes: JSON.stringify({
          searchResults: enrichedResults,
          searchedAt: new Date().toISOString()
        })
      }
    });

    // 完成日誌記錄
    if (logId) {
      await researchLogger.complete(logId, {
        output: {
          totalResults: enrichedResults.length,
          queries: additionalQueries.length + 1
        }
      });
    }

    return NextResponse.json({
      success: true,
      results: enrichedResults,
      total: enrichedResults.length,
      sessionId
    });

  } catch (error: any) {
    console.error('Search error:', error);
    
    // 記錄錯誤日誌
    if (logId) {
      await researchLogger.error(logId, error.message || 'Search failed');
    }
    
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}

// 預估來源分數
function estimateSourceScore(result: { url: string; title: string; snippet: string }): number {
  let score = 50;
  const url = result.url.toLowerCase();
  const domain = new URL(result.url).hostname.toLowerCase();
  
  // 權威來源加分
  const authorityDomains = [
    'packaging-gateway.com', 'packworld.com', 'packaging-europe.com',
    'sustainablepackaging.org', 'smithers.com', 'mckinsey.com',
    'bbc.com', 'reuters.com', 'forbes.com', 'economist.com'
  ];
  if (authorityDomains.some(d => domain.includes(d))) {
    score += 25;
  }
  
  // 學術/研究來源
  if (domain.includes('.edu') || domain.includes('.gov') || domain.includes('research')) {
    score += 20;
  }
  
  // 產業新聞
  if (domain.includes('news') || domain.includes('industry')) {
    score += 10;
  }
  
  // 社交媒體降分
  if (['facebook.com', 'twitter.com', 'instagram.com', 'pinterest.com'].some(d => domain.includes(d))) {
    score -= 30;
  }
  
  // 電商網站降分
  if (['amazon.com', 'alibaba.com', 'taobao.com', 'shopee'].some(d => domain.includes(d))) {
    score -= 20;
  }

  return Math.max(10, Math.min(100, score));
}

// 猜測來源類型
function guessSourceType(url: string, title: string): string {
  const domain = new URL(url).hostname.toLowerCase();
  const titleLower = title.toLowerCase();
  
  if (domain.includes('.edu') || titleLower.includes('research') || titleLower.includes('study')) {
    return 'ACADEMIC_PAPER';
  }
  if (titleLower.includes('report') || titleLower.includes('analysis') || titleLower.includes('市場')) {
    return 'MARKET_ANALYSIS';
  }
  if (titleLower.includes('case') || titleLower.includes('案例')) {
    return 'CASE_STUDY';
  }
  if (domain.includes('news') || titleLower.includes('新聞')) {
    return 'TRADE_NEWS';
  }
  if (domain.includes('blog') || url.includes('/blog/')) {
    return 'MANUFACTURER_BLOG';
  }
  
  return 'OTHER';
}
