// lib/research/research-engine.ts
// 全球包裝趨勢研究引擎 - 核心服務

import { prisma } from '@/lib/prisma';
import { aiOrchestrator } from './ai-orchestrator';
import { 
  RESEARCH_COLLECTION_SYSTEM_PROMPT,
  buildSourceAnalysisPrompt,
  buildModuleGenerationPrompt,
  buildTopicSuggestionPrompt
} from './prompts';
import { 
  ResearchConfig, 
  FocusArea, 
  Language, 
  Region,
  FOCUS_AREA_KEYWORDS,
  SourceEvaluation,
  ResearchModuleData
} from './types';

// 預設研究配置
const DEFAULT_CONFIG: ResearchConfig = {
  focusAreas: ['paper-packaging', 'packaging-structure', 'printing-process', 'material-innovation', 'sustainability'],
  languages: ['zh', 'en'],
  regions: ['asia', 'europe', 'americas'],
  maxSourcesPerSession: 20,
  minAuthorityScore: 60
};

export class ResearchEngine {
  private config: ResearchConfig;

  constructor(config: Partial<ResearchConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // 啟動新的研究任務
  async startResearchSession(triggerType: 'cron' | 'manual' = 'manual'): Promise<string> {
    // 建立研究任務記錄
    const session = await prisma.researchSession.create({
      data: {
        status: 'COLLECTING',
        focusAreas: this.config.focusAreas,
        languages: this.config.languages,
        regions: this.config.regions,
        triggerType
      }
    });

    console.log(`[Research Engine] Started session: ${session.id}`);
    return session.id;
  }

  // 第一階段：收集研究來源
  async collectSources(sessionId: string): Promise<void> {
    console.log(`[Research Engine] Collecting sources for session: ${sessionId}`);

    // 1. 獲取權威來源池
    const authoritySources = await this.getAuthoritySources();
    
    // 2. 生成搜索查詢
    const searchQueries = this.generateSearchQueries();
    
    // 3. 使用 AI 搜索和分析
    const sources = await this.searchAndAnalyzeSources(searchQueries, authoritySources);
    
    // 4. 過濾並儲存來源
    const filteredSources = sources.filter(s => 
      s.authorityScore >= this.config.minAuthorityScore && !s.isMarketing
    );

    for (const source of filteredSources.slice(0, this.config.maxSourcesPerSession)) {
      await prisma.researchSource.create({
        data: {
          sessionId,
          url: source.url,
          title: source.title,
          domain: source.domain,
          language: source.language,
          region: source.region,
          authorityScore: source.authorityScore,
          originalityScore: source.originalityScore,
          relevanceScore: source.relevanceScore,
          sourceType: source.sourceType,
          summary: source.summary,
          keyPoints: source.keyPoints
        }
      });
    }

    // 更新狀態
    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { status: 'ANALYZING' }
    });

    console.log(`[Research Engine] Collected ${filteredSources.length} sources`);
  }

  // 第二階段：分析並生成研究模組
  async generateModules(sessionId: string): Promise<void> {
    console.log(`[Research Engine] Generating modules for session: ${sessionId}`);

    // 獲取已收集的來源
    const sources = await prisma.researchSource.findMany({
      where: { sessionId, isExcluded: false }
    });

    if (sources.length === 0) {
      console.log('[Research Engine] No sources to analyze');
      return;
    }

    // 準備來源資料
    const sourcesData = sources.map(s => ({
      id: s.id,
      title: s.title,
      summary: s.summary || '',
      keyPoints: s.keyPoints
    }));

    // 使用 AI 生成模組
    const prompt = buildModuleGenerationPrompt(
      sourcesData,
      this.config.focusAreas as FocusArea[]
    );

    const result = await aiOrchestrator.execute(
      'MODULE_GENERATION',
      RESEARCH_COLLECTION_SYSTEM_PROMPT,
      prompt,
      { preferQuality: true }
    );

    // 解析並儲存模組
    try {
      // 清理 AI 回傳的內容，移除可能的 markdown 代碼塊標記
      let jsonContent = result.content.trim();
      
      // 移除 ```json 或 ``` 標記
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.slice(7);
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.slice(3);
      }
      if (jsonContent.endsWith('```')) {
        jsonContent = jsonContent.slice(0, -3);
      }
      jsonContent = jsonContent.trim();
      
      console.log('[Research Engine] AI response (cleaned):', jsonContent.substring(0, 500));
      
      const modules: ResearchModuleData[] = JSON.parse(jsonContent);
      
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
            supportingData: moduleData.supportingData
          }
        });

        // 建立模組與來源的關聯
        const sourceIndexes = moduleData.sourceIds || (moduleData as any).sourceIndexes || [];
        for (const sourceIndex of sourceIndexes) {
          const idx = typeof sourceIndex === 'string' ? parseInt(sourceIndex) : sourceIndex;
          const source = sources[idx - 1];
          if (source) {
            await prisma.researchModuleSource.create({
              data: {
                moduleId: module.id,
                sourceId: source.id
              }
            });
          }
        }
      }

      console.log(`[Research Engine] Generated ${modules.length} modules`);
    } catch (error) {
      console.error('[Research Engine] Error parsing modules:', error);
      console.error('[Research Engine] Raw AI response:', result.content.substring(0, 1000));
    }

    // 更新狀態為等待審核
    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { status: 'PENDING_REVIEW' }
    });
  }

  // 生成主題建議（供人類決策）
  async generateTopicSuggestions(sessionId: string): Promise<any[]> {
    const modules = await prisma.researchModule.findMany({
      where: { sessionId },
      select: {
        title_zh: true,
        moduleType: true,
        tags: true
      }
    });

    if (modules.length === 0) {
      return [];
    }

    const prompt = buildTopicSuggestionPrompt(modules);
    
    const result = await aiOrchestrator.execute(
      'INSIGHT_EXTRACTION',
      RESEARCH_COLLECTION_SYSTEM_PROMPT,
      prompt
    );

    try {
      return JSON.parse(result.content);
    } catch {
      return [];
    }
  }

  // 獲取權威來源池
  private async getAuthoritySources(): Promise<{ domain: string; name: string; category: string }[]> {
    const sources = await prisma.authoritySource.findMany({
      where: { isActive: true },
      select: { domain: true, name: true, category: true }
    });

    // 如果資料庫沒有，使用預設來源
    if (sources.length === 0) {
      return this.getDefaultAuthoritySources();
    }

    return sources;
  }

  // 預設權威來源（初始化用）
  private getDefaultAuthoritySources() {
    return [
      // 中文來源
      { domain: 'packagingdigest.com', name: 'Packaging Digest', category: 'TRADE_NEWS' },
      { domain: 'packworld.com', name: 'Packaging World', category: 'TRADE_NEWS' },
      { domain: 'smithers.com', name: 'Smithers', category: 'INDUSTRY_REPORT' },
      { domain: 'packaging-gateway.com', name: 'Packaging Gateway', category: 'TRADE_NEWS' },
      { domain: 'thepackagingportal.com', name: 'The Packaging Portal', category: 'TRADE_NEWS' },
      { domain: 'sustainablepackaging.org', name: 'Sustainable Packaging Coalition', category: 'INDUSTRY_REPORT' },
      { domain: 'fibre-packaging.org', name: 'FEFCO', category: 'INDUSTRY_REPORT' },
      { domain: 'twosides.info', name: 'Two Sides', category: 'INDUSTRY_REPORT' },
      // 亞洲來源
      { domain: 'cpp.ac.cn', name: '中國包裝', category: 'TRADE_NEWS' },
      { domain: 'packonline.com.tw', name: '包裝世界', category: 'TRADE_NEWS' }
    ];
  }

  // 生成搜索查詢
  private generateSearchQueries(): string[] {
    const queries: string[] = [];
    
    for (const area of this.config.focusAreas) {
      const keywords = FOCUS_AREA_KEYWORDS[area as FocusArea];
      if (keywords) {
        // 中文查詢
        if (this.config.languages.includes('zh')) {
          queries.push(...keywords.zh.slice(0, 2).map(k => `${k} 趨勢 2024 2025`));
        }
        // 英文查詢
        if (this.config.languages.includes('en')) {
          queries.push(...keywords.en.slice(0, 2).map(k => `${k} trends 2024 2025`));
        }
      }
    }

    return queries;
  }

  // 搜索和分析來源（使用 Serper API 或類似服務）
  private async searchAndAnalyzeSources(
    queries: string[],
    authoritySources: { domain: string; name: string; category: string }[]
  ): Promise<any[]> {
    console.log('[Research Engine] Search queries:', queries.length);
    console.log('[Research Engine] Authority sources:', authoritySources.length);
    
    // TODO: 整合 Serper API 或 Google Custom Search
    // 目前使用模擬資料進行測試
    
    const mockResults = [
      {
        url: 'https://packagingdigest.com/sustainable-packaging/2025-trends',
        title: '2025 Sustainable Packaging Trends: What to Expect',
        domain: 'packagingdigest.com',
        language: 'en',
        region: 'global',
        authorityScore: 85,
        originalityScore: 75,
        relevanceScore: 90,
        sourceType: 'TRADE_NEWS',
        summary: 'Key trends in sustainable packaging for 2025 including recycled materials, mono-material designs, and compostable alternatives.',
        keyPoints: ['Recycled content mandates', 'Mono-material packaging growth', 'Compostable solutions']
      },
      {
        url: 'https://smithers.com/reports/paper-packaging-market-2025',
        title: 'Paper Packaging Market Report 2025',
        domain: 'smithers.com',
        language: 'en',
        region: 'global',
        authorityScore: 92,
        originalityScore: 88,
        relevanceScore: 85,
        sourceType: 'INDUSTRY_REPORT',
        summary: 'Comprehensive analysis of the global paper packaging market with growth projections and emerging technologies.',
        keyPoints: ['Market growth 4.2% CAGR', 'Barrier coating innovations', 'E-commerce demand surge']
      },
      {
        url: 'https://packworld.com/structure-design/folding-carton-innovations',
        title: 'Folding Carton Structure Innovations for Premium Products',
        domain: 'packworld.com',
        language: 'en',
        region: 'americas',
        authorityScore: 80,
        originalityScore: 70,
        relevanceScore: 88,
        sourceType: 'TRADE_NEWS',
        summary: 'New structural designs in folding cartons focusing on shelf appeal and sustainability.',
        keyPoints: ['Easy-open features', 'Reduced material usage', 'Premium finish options']
      },
      {
        url: 'https://packonline.com.tw/trends/2025-packaging-design',
        title: '2025年包裝設計趨勢：永續與創新',
        domain: 'packonline.com.tw',
        language: 'zh',
        region: 'asia',
        authorityScore: 75,
        originalityScore: 72,
        relevanceScore: 85,
        sourceType: 'TRADE_NEWS',
        summary: '探討2025年亞洲市場的包裝設計趨勢，包括環保材料應用與結構創新。',
        keyPoints: ['環保材料趨勢', '結構創新設計', '印刷技術升級']
      },
      {
        url: 'https://fibre-packaging.org/research/corrugated-future',
        title: 'The Future of Corrugated Packaging',
        domain: 'fibre-packaging.org',
        language: 'en',
        region: 'europe',
        authorityScore: 88,
        originalityScore: 82,
        relevanceScore: 80,
        sourceType: 'INDUSTRY_REPORT',
        summary: 'FEFCO research on corrugated packaging innovations and sustainability initiatives.',
        keyPoints: ['Digital printing adoption', 'Lightweight solutions', 'Circular economy integration']
      }
    ];
    
    return mockResults;
  }

  // 人類審核：標記來源為已驗證
  async verifySource(sourceId: string, verified: boolean, notes?: string): Promise<void> {
    await prisma.researchSource.update({
      where: { id: sourceId },
      data: { 
        isVerified: verified,
        ...(notes && { excludeReason: notes })
      }
    });
  }

  // 人類審核：排除來源
  async excludeSource(sourceId: string, reason: string): Promise<void> {
    await prisma.researchSource.update({
      where: { id: sourceId },
      data: { 
        isExcluded: true,
        excludeReason: reason
      }
    });
  }

  // 人類審核：核准模組
  async approveModule(moduleId: string, notes?: string): Promise<void> {
    await prisma.researchModule.update({
      where: { id: moduleId },
      data: { 
        humanApproved: true,
        ...(notes && { humanNotes: notes })
      }
    });
  }

  // 人類審核：編輯模組
  async editModule(
    moduleId: string, 
    updates: Partial<{
      title_zh: string;
      title_en: string;
      conclusion_zh: string;
      conclusion_en: string;
      insight_zh: string;
      insight_en: string;
      tags: string[];
    }>
  ): Promise<void> {
    await prisma.researchModule.update({
      where: { id: moduleId },
      data: { 
        ...updates,
        humanEdited: true
      }
    });
  }

  // 完成人類審核
  async completeReview(sessionId: string, reviewerId: string, notes?: string): Promise<void> {
    await prisma.researchSession.update({
      where: { id: sessionId },
      data: {
        status: 'REVIEWED',
        humanReviewedAt: new Date(),
        humanReviewerId: reviewerId,
        ...(notes && { humanNotes: notes })
      }
    });
  }

  // 獲取研究任務詳情
  async getSessionDetails(sessionId: string) {
    return prisma.researchSession.findUnique({
      where: { id: sessionId },
      include: {
        sources: {
          orderBy: { authorityScore: 'desc' }
        },
        modules: {
          include: {
            sources: {
              include: { source: true }
            }
          }
        },
        articles: true,
        conversations: {
          include: { messages: true }
        }
      }
    });
  }

  // 獲取待審核的研究任務
  async getPendingReviewSessions() {
    return prisma.researchSession.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: {
        _count: {
          select: { sources: true, modules: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const researchEngine = new ResearchEngine();
