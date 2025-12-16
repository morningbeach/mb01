// app/api/admin/research/v2/sessions/[sessionId]/deep-research/route.ts
// 深度研究 API - AI 迭代優化搜尋，直到達成目標

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchEngine } from '@/lib/research/engines/search-engine';
import { scraperEngine } from '@/lib/research/engines/scraper-engine';
import { analysisEngine } from '@/lib/research/engines/analysis-engine';
import { aiOrchestrator } from '@/lib/research/ai-orchestrator';

export const maxDuration = 600; // 10 分鐘

interface DeepResearchGoal {
  minQualitySources: number;      // 最少高品質來源數
  minTotalWords: number;          // 最少總字數
  minAuthorityScore: number;      // 最低平均權威分數
  maxIterations: number;          // 最大迭代次數
}

// POST: 開始深度研究（串流）
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  const body = await request.json();
  
  const goal: DeepResearchGoal = {
    minQualitySources: body.minQualitySources || 10,
    minTotalWords: body.minTotalWords || 50000,
    minAuthorityScore: body.minAuthorityScore || 60,
    maxIterations: Math.min(body.maxIterations || 5, 10) // 最多 10 次
  };

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // 獲取 session
        const session = await prisma.researchSession.findUnique({
          where: { id: sessionId },
          include: {
            sources: { where: { isExcluded: false } }
          }
        });

        if (!session) {
          send({ type: 'error', message: '找不到研究任務' });
          controller.close();
          return;
        }

        send({
          type: 'start',
          message: '開始深度研究...',
          goal,
          currentSources: session.sources.length
        });

        let iteration = 0;
        let reachedGoal = false;

        while (iteration < goal.maxIterations && !reachedGoal) {
          iteration++;
          
          send({
            type: 'iteration_start',
            iteration,
            maxIterations: goal.maxIterations,
            message: `第 ${iteration} 輪迭代開始...`
          });

          // Step 1: 分析現有來源，生成新搜尋關鍵字
          const currentSources = await prisma.researchSource.findMany({
            where: { sessionId, isExcluded: false }
          });

          send({
            type: 'generating_keywords',
            message: `分析 ${currentSources.length} 個來源，生成新搜尋關鍵字...`
          });

          const newKeywords = await generateOptimizedKeywords(
            session.topic || '',
            session.focusAreas || [],
            currentSources.map(s => ({
              title: s.title,
              summary: s.summary || '',
              keyPoints: s.keyPoints as string[]
            })),
            iteration
          );

          send({
            type: 'keywords_generated',
            keywords: newKeywords,
            message: `生成 ${newKeywords.length} 組新搜尋關鍵字`
          });

          // Step 2: 使用新關鍵字搜尋
          const existingUrls = new Set(currentSources.map(s => s.url));
          let newUrls: { url: string; title: string }[] = [];

          for (const keyword of newKeywords) {
            send({
              type: 'searching',
              keyword,
              message: `搜尋: ${keyword}`
            });

            try {
              const results = await searchEngine.searchPackaging(keyword, {
                regions: session.regions || ['tw', 'global'],
                languages: session.languages || ['zh', 'en'],
                focusAreas: session.focusAreas || []
              });

              // 過濾已存在的 URL
              const freshResults = results.filter(r => !existingUrls.has(r.url));
              newUrls.push(...freshResults.slice(0, 5).map(r => ({
                url: r.url,
                title: r.title
              })));
              
              // 加入已存在列表避免重複
              freshResults.forEach(r => existingUrls.add(r.url));
            } catch (e: any) {
              send({
                type: 'search_error',
                keyword,
                error: e.message
              });
            }
          }

          // 去重
          newUrls = [...new Map(newUrls.map(u => [u.url, u])).values()];

          send({
            type: 'search_complete',
            newUrlsCount: newUrls.length,
            message: `找到 ${newUrls.length} 個新來源`
          });

          if (newUrls.length === 0) {
            send({
              type: 'no_new_sources',
              message: '沒有找到新來源，嘗試下一輪...'
            });
            continue;
          }

          // Step 3: 抓取和分析新來源
          let scrapedCount = 0;
          let analyzedCount = 0;

          for (let i = 0; i < newUrls.length; i++) {
            const urlInfo = newUrls[i];
            
            send({
              type: 'scraping',
              current: i + 1,
              total: newUrls.length,
              url: urlInfo.url,
              message: `[${i + 1}/${newUrls.length}] 抓取: ${urlInfo.title.slice(0, 40)}...`
            });

            try {
              const scraped = await scraperEngine.scrape(urlInfo.url, {
                timeout: 30000,
                maxLength: 30000
              });

              if (!scraped.success || !scraped.content) {
                send({
                  type: 'scrape_failed',
                  url: urlInfo.url,
                  message: `抓取失敗: ${urlInfo.title.slice(0, 30)}...`
                });
                continue;
              }

              scrapedCount++;

              send({
                type: 'analyzing',
                current: i + 1,
                total: newUrls.length,
                wordCount: scraped.wordCount,
                message: `分析中: ${urlInfo.title.slice(0, 35)}... (${scraped.wordCount} 字)`
              });

              const analysis = await analysisEngine.analyzeSource(
                scraped,
                session.topic || '',
                session.focusAreas || []
              );

              // 儲存到資料庫
              await prisma.researchSource.create({
                data: {
                  sessionId,
                  url: analysis.url,
                  title: analysis.title || scraped.title,
                  domain: new URL(urlInfo.url).hostname,
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

              analyzedCount++;

              send({
                type: 'source_added',
                title: analysis.title,
                authorityScore: analysis.authorityScore,
                relevanceScore: analysis.relevanceScore,
                message: `✓ 新增: ${(analysis.title || urlInfo.title).slice(0, 30)}... (權威: ${analysis.authorityScore})`
              });

            } catch (e: any) {
              send({
                type: 'source_error',
                url: urlInfo.url,
                error: e.message
              });
            }
          }

          send({
            type: 'iteration_complete',
            iteration,
            scrapedCount,
            analyzedCount,
            message: `第 ${iteration} 輪完成: 抓取 ${scrapedCount}，分析 ${analyzedCount}`
          });

          // Step 4: 檢查是否達成目標
          const updatedSources = await prisma.researchSource.findMany({
            where: { sessionId, isExcluded: false }
          });

          const qualitySources = updatedSources.filter(s => s.authorityScore >= goal.minAuthorityScore);
          const totalWords = updatedSources.reduce((sum, s) => {
            const wordCount = (s.summary?.length || 0) + 
                             ((s.keyPoints as string[])?.join('').length || 0);
            return sum + wordCount;
          }, 0);
          const avgAuthority = updatedSources.length > 0
            ? updatedSources.reduce((sum, s) => sum + s.authorityScore, 0) / updatedSources.length
            : 0;

          const stats = {
            totalSources: updatedSources.length,
            qualitySources: qualitySources.length,
            totalWords,
            avgAuthority: Math.round(avgAuthority)
          };

          send({
            type: 'progress_check',
            stats,
            goal,
            message: `進度: ${qualitySources.length}/${goal.minQualitySources} 高品質來源`
          });

          // 檢查是否達成目標
          if (qualitySources.length >= goal.minQualitySources) {
            reachedGoal = true;
            send({
              type: 'goal_reached',
              reason: 'quality_sources',
              stats,
              message: `🎉 達成目標！高品質來源: ${qualitySources.length}`
            });
          }
        }

        // 最終結果
        const finalSources = await prisma.researchSource.findMany({
          where: { sessionId, isExcluded: false }
        });

        const finalStats = {
          totalSources: finalSources.length,
          qualitySources: finalSources.filter(s => s.authorityScore >= goal.minAuthorityScore).length,
          avgAuthority: Math.round(
            finalSources.reduce((sum, s) => sum + s.authorityScore, 0) / finalSources.length
          ),
          iterations: iteration
        };

        send({
          type: 'complete',
          stats: finalStats,
          reachedGoal,
          message: reachedGoal 
            ? `✅ 深度研究完成！共 ${finalStats.totalSources} 個來源`
            : `⚠️ 達到最大迭代次數，共 ${finalStats.totalSources} 個來源`
        });

      } catch (error: any) {
        console.error('Deep research error:', error);
        send({
          type: 'error',
          message: error.message || '深度研究失敗'
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// AI 生成優化搜尋關鍵字
async function generateOptimizedKeywords(
  topic: string,
  focusAreas: string[],
  existingSources: { title: string; summary: string; keyPoints: string[] }[],
  iteration: number
): Promise<string[]> {
  const sourceSummary = existingSources.slice(0, 10).map(s => 
    `- ${s.title}: ${s.summary?.slice(0, 100) || s.keyPoints?.slice(0, 3).join(', ')}`
  ).join('\n');

  const prompt = `基於以下研究主題和已收集的來源，請生成 ${3 + iteration} 組新的搜尋關鍵字來擴展研究範圍。

## 研究主題
${topic}

## 研究焦點
${focusAreas.join(', ') || '趨勢、材料、設計、市場'}

## 已收集來源 (共 ${existingSources.length} 個)
${sourceSummary || '尚無來源'}

## 要求
1. 關鍵字應該能找到尚未涵蓋的角度
2. 包含不同語言變體（繁中、簡中、英文）
3. 嘗試找到權威來源（研究報告、產業分析、官方資料）
4. 第 ${iteration} 輪應該更深入或更具體
5. 避免重複已有來源的內容

請以 JSON 陣列格式輸出：
["關鍵字1", "關鍵字2", "關鍵字3", ...]

只輸出 JSON，不要其他文字。`;

  try {
    const result = await aiOrchestrator.execute(
      'KEYWORD_GENERATION',
      '你是搜尋優化專家，專精於包裝產業研究。請生成能找到高品質來源的搜尋關鍵字。',
      prompt,
      { temperature: 0.7, maxTokens: 500 }
    );

    let content = result.content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/```json?\n?/g, '').replace(/```/g, '');
    }

    const keywords = JSON.parse(content);
    return Array.isArray(keywords) ? keywords.slice(0, 8) : [];
  } catch (error) {
    console.error('Error generating keywords:', error);
    // 備用關鍵字
    return [
      `${topic} 研究報告`,
      `${topic} 趨勢分析`,
      `${topic} industry report`,
      `${topic} market analysis`
    ];
  }
}
