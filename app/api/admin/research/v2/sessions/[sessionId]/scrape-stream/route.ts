// app/api/admin/research/v2/sessions/[sessionId]/scrape-stream/route.ts
// 串流抓取 API - 即時回報進度

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scraperEngine } from '@/lib/research/engines/scraper-engine';
import { analysisEngine } from '@/lib/research/engines/analysis-engine';
import { researchLogger } from '@/lib/research/core/research-logger';

export const maxDuration = 300;

// POST: 串流抓取並分析選定的 URL
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  const body = await request.json();
  const { selectedUrls } = body;

  // 建立可讀流
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let logId: string | null = null;

      try {
        if (!selectedUrls || !Array.isArray(selectedUrls) || selectedUrls.length === 0) {
          send({ type: 'error', message: '未選擇任何連結' });
          controller.close();
          return;
        }

        // 獲取 session
        const session = await prisma.researchSession.findUnique({
          where: { id: sessionId }
        });

        if (!session) {
          send({ type: 'error', message: '找不到研究任務' });
          controller.close();
          return;
        }

        // 開始記錄
        logId = await researchLogger.start({
          sessionId,
          action: 'scrape_start',
          input: { urlCount: selectedUrls.length, stream: true }
        });

        // 發送開始事件
        send({ 
          type: 'start', 
          total: selectedUrls.length,
          message: `開始抓取 ${selectedUrls.length} 個連結...`
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
        for (let i = 0; i < selectedUrls.length; i++) {
          const urlInfo = selectedUrls[i];
          const url = typeof urlInfo === 'string' ? urlInfo : urlInfo.url;
          const title = typeof urlInfo === 'string' ? url : (urlInfo.title || url);
          
          // 發送進度 - 開始抓取
          send({
            type: 'progress',
            current: i + 1,
            total: selectedUrls.length,
            step: 'scraping',
            url: url,
            title: title.slice(0, 50),
            message: `[${i + 1}/${selectedUrls.length}] 抓取中: ${title.slice(0, 40)}...`
          });

          try {
            // 抓取內容
            const scraped = await scraperEngine.scrape(url, {
              timeout: 30000,
              maxLength: 30000
            });

            if (!scraped.success || !scraped.content) {
              results.failed++;
              send({
                type: 'item_failed',
                current: i + 1,
                url: url,
                title: title.slice(0, 50),
                reason: scraped.error || '無法抓取內容',
                message: `✗ 抓取失敗: ${title.slice(0, 30)}...`
              });
              continue;
            }

            results.scraped++;
            
            // 發送進度 - 開始分析
            send({
              type: 'progress',
              current: i + 1,
              total: selectedUrls.length,
              step: 'analyzing',
              url: url,
              title: title.slice(0, 50),
              wordCount: scraped.wordCount,
              message: `[${i + 1}/${selectedUrls.length}] AI 分析中: ${title.slice(0, 35)}... (${scraped.wordCount} 字)`
            });

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

            // 發送成功事件
            send({
              type: 'item_success',
              current: i + 1,
              url: url,
              title: source.title?.slice(0, 50) || title.slice(0, 50),
              authorityScore: source.authorityScore,
              relevanceScore: source.relevanceScore,
              sourceType: analysis.sourceType,
              message: `✓ 完成: ${(source.title || title).slice(0, 30)}... (權威: ${source.authorityScore}, 相關: ${source.relevanceScore})`
            });

          } catch (urlError: any) {
            console.error(`Error processing ${url}:`, urlError.message);
            results.failed++;
            send({
              type: 'item_failed',
              current: i + 1,
              url: url,
              title: title.slice(0, 50),
              reason: urlError.message,
              message: `✗ 錯誤: ${title.slice(0, 30)}... - ${urlError.message}`
            });
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

        // 發送完成事件
        send({
          type: 'complete',
          results: results,
          message: `完成！成功抓取 ${results.scraped} 個，分析 ${results.analyzed} 個，失敗 ${results.failed} 個`
        });

      } catch (error: any) {
        console.error('Scrape stream error:', error);
        
        if (logId) {
          await researchLogger.error(logId, error.message || 'Scrape stream failed');
        }
        
        send({
          type: 'error',
          message: error.message || '抓取過程發生錯誤'
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
