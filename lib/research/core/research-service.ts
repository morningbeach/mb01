// lib/research/core/research-service.ts
// 核心研究服務 - 整合搜尋、擷取、分析的完整研究流程

import { prisma } from '@/lib/prisma';
import { searchEngine, SearchResult } from '../engines/search-engine';
import { scraperEngine, ScrapedContent } from '../engines/scraper-engine';
import { analysisEngine, SourceAnalysis, ResearchModule } from '../engines/analysis-engine';

export interface ResearchProgress {
  phase: 'searching' | 'scraping' | 'analyzing' | 'generating' | 'completed' | 'error';
  step: string;
  progress: number; // 0-100
  details?: string;
}

export interface ResearchOptions {
  topic: string;
  focusAreas: string[];
  regions?: string[];
  languages?: string[];
  depth?: 'quick' | 'standard' | 'deep';
  additionalUrls?: string[];
  timeRange?: 'month' | 'quarter' | 'year';
  // 市場設定
  marketType?: string;
  targetAudience?: string[];
  industryTags?: string[];
}

export interface ResearchResult {
  sessionId: string;
  searchResults: number;
  scrapedSources: number;
  analyzedSources: number;
  generatedModules: number;
  status: string;
}

export class ResearchService {
  private progressCallback?: (progress: ResearchProgress) => void;

  // 設定進度回調
  onProgress(callback: (progress: ResearchProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(progress: ResearchProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
    console.log(`[ResearchService] ${progress.phase}: ${progress.step} (${progress.progress}%)`);
  }

  // 建立新研究任務
  async createSession(options: ResearchOptions): Promise<string> {
    const session = await prisma.researchSession.create({
      data: {
        topic: options.topic,
        status: 'COLLECTING',
        focusAreas: options.focusAreas,
        languages: options.languages || ['zh', 'en'],
        regions: options.regions || ['tw', 'global'],
        triggerType: 'manual',
        // 市場設定
        marketType: options.marketType || 'all',
        targetAudience: options.targetAudience || [],
        industryTags: options.industryTags || []
      }
    });

    console.log(`[ResearchService] Created session: ${session.id}`);
    return session.id;
  }

  // 執行完整研究流程
  async executeResearch(
    sessionId: string,
    options: ResearchOptions
  ): Promise<ResearchResult> {
    try {
      // 更新狀態
      await prisma.researchSession.update({
        where: { id: sessionId },
        data: { status: 'COLLECTING' }
      });

      // Phase 1: 搜尋
      this.updateProgress({
        phase: 'searching',
        step: '正在搜尋相關資料...',
        progress: 0
      });

      const searchResults = await this.performSearch(options);
      
      this.updateProgress({
        phase: 'searching',
        step: `找到 ${searchResults.length} 筆搜尋結果`,
        progress: 20
      });

      // Phase 2: 擷取網頁內容
      this.updateProgress({
        phase: 'scraping',
        step: '正在擷取網頁內容...',
        progress: 25
      });

      const scrapedContents = await this.scrapeContents(
        searchResults,
        options.additionalUrls || [],
        (completed, total) => {
          this.updateProgress({
            phase: 'scraping',
            step: `擷取中 ${completed}/${total}`,
            progress: 25 + (completed / total) * 25
          });
        }
      );

      // Phase 3: AI 分析
      this.updateProgress({
        phase: 'analyzing',
        step: '正在分析來源品質...',
        progress: 50
      });

      await prisma.researchSession.update({
        where: { id: sessionId },
        data: { status: 'ANALYZING' }
      });

      const analyzedSources = await this.analyzeSources(
        scrapedContents,
        options,
        sessionId,
        (completed, total) => {
          this.updateProgress({
            phase: 'analyzing',
            step: `分析中 ${completed}/${total}`,
            progress: 50 + (completed / total) * 25
          });
        }
      );

      // Phase 4: 生成研究模組
      this.updateProgress({
        phase: 'generating',
        step: '正在生成研究模組...',
        progress: 75
      });

      const modules = await this.generateModules(
        analyzedSources,
        options,
        sessionId
      );

      // 完成
      await prisma.researchSession.update({
        where: { id: sessionId },
        data: { status: 'PENDING_REVIEW' }
      });

      this.updateProgress({
        phase: 'completed',
        step: '研究完成！',
        progress: 100,
        details: `生成了 ${modules.length} 個研究模組`
      });

      return {
        sessionId,
        searchResults: searchResults.length,
        scrapedSources: scrapedContents.filter(c => c.success).length,
        analyzedSources: analyzedSources.length,
        generatedModules: modules.length,
        status: 'PENDING_REVIEW'
      };

    } catch (error: any) {
      console.error('[ResearchService] Research error:', error);
      
      await prisma.researchSession.update({
        where: { id: sessionId },
        data: { 
          status: 'COLLECTING',
          humanNotes: `Error: ${error.message}`
        }
      });

      this.updateProgress({
        phase: 'error',
        step: '研究過程發生錯誤',
        progress: 0,
        details: error.message
      });

      throw error;
    }
  }

  // 執行搜尋
  private async performSearch(options: ResearchOptions): Promise<SearchResult[]> {
    const depthConfig = {
      quick: { queriesPerArea: 2, resultsPerQuery: 5 },
      standard: { queriesPerArea: 3, resultsPerQuery: 10 },
      deep: { queriesPerArea: 5, resultsPerQuery: 15 }
    };

    const config = depthConfig[options.depth || 'standard'];
    
    const results = await searchEngine.searchPackaging(options.topic, {
      regions: options.regions,
      languages: options.languages,
      focusAreas: options.focusAreas,
      timeRange: options.timeRange || 'year'
    });

    return results.slice(0, config.resultsPerQuery * config.queriesPerArea);
  }

  // 擷取網頁內容
  private async scrapeContents(
    searchResults: SearchResult[],
    additionalUrls: string[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<ScrapedContent[]> {
    // 合併 URL 列表
    const allUrls = [
      ...searchResults.map(r => r.url),
      ...additionalUrls
    ];

    // 去重
    const uniqueUrls = [...new Set(allUrls)];

    return scraperEngine.scrapeMultiple(uniqueUrls, {
      timeout: 30000,
      maxLength: 30000
    }, onProgress);
  }

  // 分析來源
  private async analyzeSources(
    contents: ScrapedContent[],
    options: ResearchOptions,
    sessionId: string,
    onProgress?: (completed: number, total: number) => void
  ): Promise<SourceAnalysis[]> {
    const successfulContents = contents.filter(c => c.success && c.content);
    
    const analyses = await analysisEngine.analyzeSources(
      successfulContents,
      options.topic,
      options.focusAreas,
      onProgress
    );

    // 儲存到資料庫
    for (const analysis of analyses) {
      await prisma.researchSource.create({
        data: {
          sessionId,
          url: analysis.url,
          title: analysis.title,
          domain: this.extractDomain(analysis.url),
          language: analysis.language,
          region: analysis.region,
          authorityScore: analysis.authorityScore,
          originalityScore: analysis.originalityScore,
          relevanceScore: analysis.relevanceScore,
          sourceType: analysis.sourceType as any,
          summary: analysis.summary,
          keyPoints: analysis.keyPoints,
          isVerified: false,
          isExcluded: analysis.isMarketing || analysis.authorityScore < 40
        }
      });
    }

    return analyses;
  }

  // 生成研究模組
  private async generateModules(
    sources: SourceAnalysis[],
    options: ResearchOptions,
    sessionId: string
  ): Promise<ResearchModule[]> {
    const modules = await analysisEngine.generateModules(
      sources,
      options.topic,
      options.focusAreas
    );

    // 儲存到資料庫
    const dbSources = await prisma.researchSource.findMany({
      where: { sessionId }
    });

    for (const moduleData of modules) {
      const module = await prisma.researchModule.create({
        data: {
          sessionId,
          moduleType: moduleData.moduleType,
          title_zh: moduleData.title_zh,
          title_en: moduleData.title_en,
          conclusion_zh: moduleData.conclusion_zh,
          conclusion_en: moduleData.conclusion_en,
          insight_zh: moduleData.insight_zh,
          insight_en: moduleData.insight_en,
          tags: moduleData.tags,
          supportingData: JSON.parse(JSON.stringify({
            confidenceScore: moduleData.confidenceScore,
            facts: moduleData.supportingFacts
          }))
        }
      });

      // 建立來源關聯
      for (const sourceUrl of moduleData.sourceUrls) {
        const dbSource = dbSources.find(s => s.url === sourceUrl);
        if (dbSource) {
          await prisma.researchModuleSource.create({
            data: {
              moduleId: module.id,
              sourceId: dbSource.id
            }
          });
        }
      }
    }

    return modules;
  }

  // 追加研究 URL
  async addUrls(sessionId: string, urls: string[]): Promise<{
    scraped: number;
    analyzed: number;
  }> {
    const session = await prisma.researchSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // 擷取新 URL
    const scrapedContents = await scraperEngine.scrapeMultiple(urls);
    const successfulContents = scrapedContents.filter(c => c.success);

    // 分析新來源
    const analyses = await analysisEngine.analyzeSources(
      successfulContents,
      session.topic || '',
      session.focusAreas
    );

    // 儲存到資料庫
    for (const analysis of analyses) {
      await prisma.researchSource.create({
        data: {
          sessionId,
          url: analysis.url,
          title: analysis.title,
          domain: this.extractDomain(analysis.url),
          language: analysis.language,
          region: analysis.region,
          authorityScore: analysis.authorityScore,
          originalityScore: analysis.originalityScore,
          relevanceScore: analysis.relevanceScore,
          sourceType: analysis.sourceType as any,
          summary: analysis.summary,
          keyPoints: analysis.keyPoints,
          isVerified: false,
          isExcluded: analysis.isMarketing
        }
      });
    }

    return {
      scraped: successfulContents.length,
      analyzed: analyses.length
    };
  }

  // 重新生成模組
  async regenerateModules(sessionId: string): Promise<number> {
    // 刪除現有模組
    await prisma.researchModule.deleteMany({
      where: { sessionId }
    });

    // 獲取來源
    const sources = await prisma.researchSource.findMany({
      where: { sessionId, isExcluded: false }
    });

    const session = await prisma.researchSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || sources.length === 0) {
      return 0;
    }

    // 轉換格式
    const sourceAnalyses: SourceAnalysis[] = sources.map(s => ({
      url: s.url,
      title: s.title,
      authorityScore: s.authorityScore,
      originalityScore: s.originalityScore,
      relevanceScore: s.relevanceScore,
      isMarketing: false,
      sourceType: s.sourceType as any,
      summary: s.summary || '',
      keyPoints: s.keyPoints,
      facts: [],
      language: s.language,
      region: s.region
    }));

    // 重新生成
    const modules = await this.generateModules(
      sourceAnalyses,
      {
        topic: session.topic || '',
        focusAreas: session.focusAreas
      },
      sessionId
    );

    return modules.length;
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }
}

export const researchService = new ResearchService();
