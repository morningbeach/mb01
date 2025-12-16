// lib/research/engines/analysis-engine.ts
// AI 分析引擎 - 內容分析、來源評估、模組生成

import { aiOrchestrator } from '../ai-orchestrator';
import { ScrapedContent } from './scraper-engine';
import { SearchResult } from './search-engine';

export interface SourceAnalysis {
  url: string;
  title: string;
  authorityScore: number;      // 0-100 權威性
  originalityScore: number;    // 0-100 原創性
  relevanceScore: number;      // 0-100 相關性
  isMarketing: boolean;        // 是否為行銷導向
  sourceType: SourceType;
  summary: string;
  keyPoints: string[];
  facts: ExtractedFact[];
  language: string;
  region: string;
}

export type SourceType = 
  | 'INDUSTRY_REPORT'
  | 'ACADEMIC_PAPER'
  | 'TRADE_NEWS'
  | 'MANUFACTURER_BLOG'
  | 'CONFERENCE'
  | 'CASE_STUDY'
  | 'MARKET_ANALYSIS'
  | 'TUTORIAL'
  | 'OTHER';

export interface ExtractedFact {
  statement: string;
  type: 'statistic' | 'trend' | 'opinion' | 'case' | 'definition';
  confidence: number;
  source: string;
}

export interface ResearchModule {
  moduleType: ModuleType;
  title_zh: string;
  title_en: string;
  conclusion_zh: string;
  conclusion_en: string;
  insight_zh: string;
  insight_en: string;
  tags: string[];
  confidenceScore: number;
  supportingFacts: ExtractedFact[];
  sourceUrls: string[];
}

export type ModuleType = 
  | 'TREND'
  | 'MATERIAL'
  | 'STRUCTURE'
  | 'PROCESS'
  | 'CASE'
  | 'MARKET_INSIGHT'
  | 'SUSTAINABILITY'
  | 'INNOVATION'
  | 'REGULATION';

export class AnalysisEngine {
  
  // 分析單一來源
  async analyzeSource(
    content: ScrapedContent,
    topic: string,
    focusAreas: string[] = []
  ): Promise<SourceAnalysis> {
    const prompt = this.buildSourceAnalysisPrompt(content, topic, focusAreas);
    
    const result = await aiOrchestrator.execute(
      'SOURCE_ANALYSIS',
      this.getSystemPrompt(),
      prompt,
      { temperature: 0.3 }
    );
    
    try {
      const analysis = this.parseJsonResponse(result.content);
      
      return {
        url: content.url,
        title: content.title || analysis.title || '',
        authorityScore: analysis.authorityScore || 50,
        originalityScore: analysis.originalityScore || 50,
        relevanceScore: analysis.relevanceScore || 50,
        isMarketing: analysis.isMarketing || false,
        sourceType: analysis.sourceType || 'OTHER',
        summary: analysis.summary || '',
        keyPoints: analysis.keyPoints || [],
        facts: analysis.facts || [],
        language: content.language,
        region: this.inferRegion(content.url)
      };
    } catch (error) {
      console.error('[AnalysisEngine] Error parsing source analysis:', error);
      
      // 回傳基本分析
      return {
        url: content.url,
        title: content.title,
        authorityScore: 50,
        originalityScore: 50,
        relevanceScore: 50,
        isMarketing: false,
        sourceType: 'OTHER',
        summary: content.content.substring(0, 300),
        keyPoints: [],
        facts: [],
        language: content.language,
        region: this.inferRegion(content.url)
      };
    }
  }

  // 批次分析來源
  async analyzeSources(
    contents: ScrapedContent[],
    topic: string,
    focusAreas: string[] = [],
    onProgress?: (completed: number, total: number) => void
  ): Promise<SourceAnalysis[]> {
    const results: SourceAnalysis[] = [];
    
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      
      if (!content.success || !content.content) {
        continue;
      }
      
      try {
        const analysis = await this.analyzeSource(content, topic, focusAreas);
        results.push(analysis);
        
        if (onProgress) {
          onProgress(i + 1, contents.length);
        }
      } catch (error) {
        console.error(`[AnalysisEngine] Error analyzing ${content.url}:`, error);
      }
    }
    
    return results;
  }

  // 生成研究模組
  async generateModules(
    sources: SourceAnalysis[],
    topic: string,
    focusAreas: string[] = []
  ): Promise<ResearchModule[]> {
    // 過濾低品質來源
    const qualitySources = sources.filter(s => 
      s.authorityScore >= 50 && 
      s.relevanceScore >= 50 && 
      !s.isMarketing
    );
    
    if (qualitySources.length === 0) {
      console.warn('[AnalysisEngine] No quality sources to generate modules');
      return [];
    }
    
    const prompt = this.buildModuleGenerationPrompt(qualitySources, topic, focusAreas);
    
    const result = await aiOrchestrator.execute(
      'MODULE_GENERATION',
      this.getSystemPrompt(),
      prompt,
      { preferQuality: true, temperature: 0.4 }
    );
    
    try {
      const modules = this.parseJsonResponse(result.content);
      
      if (!Array.isArray(modules)) {
        console.error('[AnalysisEngine] Expected array of modules');
        return [];
      }
      
      return modules.map((m: any) => ({
        moduleType: m.moduleType || 'TREND',
        title_zh: m.title_zh || '',
        title_en: m.title_en || '',
        conclusion_zh: m.conclusion_zh || '',
        conclusion_en: m.conclusion_en || '',
        insight_zh: m.insight_zh || '',
        insight_en: m.insight_en || '',
        tags: m.tags || [],
        confidenceScore: m.confidenceScore || 70,
        supportingFacts: m.supportingFacts || [],
        sourceUrls: m.sourceUrls || []
      }));
    } catch (error) {
      console.error('[AnalysisEngine] Error parsing modules:', error);
      return [];
    }
  }

  // 交叉驗證事實
  async crossValidateFacts(
    facts: ExtractedFact[],
    sources: SourceAnalysis[]
  ): Promise<ExtractedFact[]> {
    // 計算每個事實在多少來源中被提及
    const factCounts = new Map<string, number>();
    
    for (const fact of facts) {
      const similarFacts = facts.filter(f => 
        this.isSimilarFact(fact.statement, f.statement) && f !== fact
      );
      factCounts.set(fact.statement, similarFacts.length + 1);
    }
    
    // 根據出現次數調整信心分數
    return facts.map(fact => ({
      ...fact,
      confidence: Math.min(100, fact.confidence + (factCounts.get(fact.statement) || 1) * 10)
    }));
  }

  // 建立來源分析提示詞
  private buildSourceAnalysisPrompt(
    content: ScrapedContent,
    topic: string,
    focusAreas: string[]
  ): string {
    return `請分析以下網頁內容，評估其作為「${topic}」研究來源的品質。

## 網頁資訊
URL: ${content.url}
標題: ${content.title}
字數: ${content.wordCount}

## 內容摘要（前 3000 字）
${content.content.substring(0, 3000)}

## 研究焦點
${focusAreas.join(', ') || '包裝趨勢、材料、設計、市場'}

請以 JSON 格式輸出分析結果：
{
  "authorityScore": 0-100,
  "originalityScore": 0-100,
  "relevanceScore": 0-100,
  "isMarketing": boolean,
  "sourceType": "INDUSTRY_REPORT" | "ACADEMIC_PAPER" | "TRADE_NEWS" | "MANUFACTURER_BLOG" | "CONFERENCE" | "CASE_STUDY" | "MARKET_ANALYSIS" | "TUTORIAL" | "OTHER",
  "summary": "200字以內的中文摘要",
  "keyPoints": ["關鍵點1", "關鍵點2", ...],
  "facts": [
    {
      "statement": "具體的事實陳述",
      "type": "statistic" | "trend" | "opinion" | "case" | "definition",
      "confidence": 0-100,
      "source": "來源說明"
    }
  ]
}

評分標準：
- 權威性: 發布者是否為權威機構？是否有專業背景？
- 原創性: 是否為原創研究/分析？還是轉載/二手資料？
- 相關性: 與研究主題的相關程度
- 行銷導向: 是否主要目的為推銷產品/服務？`;
  }

  // 建立模組生成提示詞
  private buildModuleGenerationPrompt(
    sources: SourceAnalysis[],
    topic: string,
    focusAreas: string[]
  ): string {
    const sourcesText = sources.map((s, i) => `
## 來源 ${i + 1}: ${s.title}
- URL: ${s.url}
- 權威性: ${s.authorityScore}/100
- 類型: ${s.sourceType}
- 摘要: ${s.summary}
- 關鍵點: ${s.keyPoints.join('; ')}
- 事實: ${s.facts.map(f => f.statement).join('; ')}
`).join('\n');

    return `基於以下 ${sources.length} 個研究來源，請為主題「${topic}」生成結構化的研究模組。

${sourcesText}

## 研究焦點
${focusAreas.join(', ') || '趨勢、材料、設計、市場'}

## 要求
1. 只生成有充分來源支撐的模組（至少 1 個來源）
2. 每個模組必須包含可引用的具體觀點
3. 模組類型可選: TREND, MATERIAL, STRUCTURE, PROCESS, CASE, MARKET_INSIGHT, SUSTAINABILITY, INNOVATION
4. 信心分數基於來源數量和權威性

請以 JSON 陣列格式輸出：
[
  {
    "moduleType": "TREND",
    "title_zh": "繁體中文標題",
    "title_en": "English Title",
    "conclusion_zh": "150-200字的核心結論，必須有來源支撐",
    "conclusion_en": "English conclusion",
    "insight_zh": "50-80字的可引用觀點",
    "insight_en": "Quotable insight",
    "tags": ["標籤1", "標籤2"],
    "confidenceScore": 0-100,
    "supportingFacts": [{"statement": "...", "type": "...", "confidence": 80}],
    "sourceUrls": ["https://..."]
  }
]

注意：寧精勿濫，只生成有實質內容的模組。`;
  }

  private getSystemPrompt(): string {
    return `你是一位專業的包裝產業研究分析師，專注於紙類包裝、提袋設計、材料創新和 B2B 市場趨勢。

你的任務是分析來源內容並生成結構化的研究輸出。

核心原則：
1. 基於事實，避免臆測
2. 重視原創性和權威性
3. 辨識行銷內容，降低其評分
4. 輸出必須是有效的 JSON 格式
5. 所有分析必須有來源支撐`;
  }

  private parseJsonResponse(content: string): any {
    // 清理 AI 回傳的內容
    let jsonContent = content.trim();
    
    // 移除 markdown 代碼塊
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith('```')) {
      jsonContent = jsonContent.slice(0, -3);
    }
    
    return JSON.parse(jsonContent.trim());
  }

  private inferRegion(url: string): string {
    const domain = url.toLowerCase();
    
    if (domain.includes('.tw') || domain.includes('taiwan')) return 'tw';
    if (domain.includes('.cn') || domain.includes('china')) return 'cn';
    if (domain.includes('.jp') || domain.includes('japan')) return 'jp';
    if (domain.includes('.kr') || domain.includes('korea')) return 'kr';
    if (domain.includes('.de') || domain.includes('.fr') || domain.includes('.uk')) return 'europe';
    if (domain.includes('.com') || domain.includes('.org')) return 'global';
    
    return 'global';
  }

  private isSimilarFact(fact1: string, fact2: string): boolean {
    // 簡單的相似度檢測
    const words1 = fact1.toLowerCase().split(/\s+/);
    const words2 = fact2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(w => words2.includes(w) && w.length > 2);
    const similarity = commonWords.length / Math.max(words1.length, words2.length);
    
    return similarity > 0.5;
  }
}

export const analysisEngine = new AnalysisEngine();
