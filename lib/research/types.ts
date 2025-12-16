// lib/research/types.ts
// 研究系統類型定義

export interface ResearchConfig {
  focusAreas: FocusArea[];
  languages: Language[];
  regions: Region[];
  maxSourcesPerSession: number;
  minAuthorityScore: number;
}

export type FocusArea = 
  | 'paper-packaging'      // 紙類包裝
  | 'packaging-structure'  // 包裝結構
  | 'printing-process'     // 印刷加工
  | 'material-innovation'  // 材料創新
  | 'sustainability'       // 永續包裝
  | 'market-trends'        // 市場趨勢
  | 'b2b-packaging';       // B2B 包裝產品

export type Language = 'zh' | 'en';
export type Region = 'asia' | 'europe' | 'americas' | 'global';

export interface SourceEvaluation {
  authorityScore: number;    // 0-100 權威性
  originalityScore: number;  // 0-100 原創性
  relevanceScore: number;    // 0-100 相關性
  isMarketing: boolean;      // 是否為行銷導向
  reasoning: string;         // 評估理由
}

export interface ResearchModuleData {
  moduleType: ModuleType;
  title_zh: string;
  title_en: string;
  conclusion_zh: string;
  conclusion_en: string;
  insight_zh?: string;
  insight_en?: string;
  supportingData?: Record<string, any>;
  tags: string[];
  sourceIds: string[];
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

export interface AIModelSelection {
  provider: 'openai' | 'anthropic' | 'google';
  modelId: string;
  taskType: AITaskType;
}

export type AITaskType = 
  | 'RESEARCH_COLLECTION'
  | 'SOURCE_ANALYSIS'
  | 'MODULE_GENERATION'
  | 'INSIGHT_EXTRACTION'
  | 'WRITING_ASSISTANCE'
  | 'CONVERSATION'
  | 'TRANSLATION'
  | 'SUMMARIZATION';

export interface ResearchPrompt {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface ArticleOutline {
  title: string;
  sections: {
    heading: string;
    moduleIds: string[];
    description: string;
  }[];
  estimatedWordCount: number;
}

export interface WritingStyle {
  tone: 'professional' | 'analytical' | 'informative';
  formality: 'formal' | 'semi-formal';
  perspective: 'third-person' | 'first-person-plural';
  targetAudience: string;
}

export const DEFAULT_WRITING_STYLE: WritingStyle = {
  tone: 'professional',
  formality: 'formal',
  perspective: 'third-person',
  targetAudience: 'B2B 包裝產業從業人員、採購決策者、產品經理'
};

export const FOCUS_AREA_KEYWORDS: Record<FocusArea, { zh: string[]; en: string[] }> = {
  'paper-packaging': {
    zh: ['紙類包裝', '紙盒', '瓦楞紙', '白卡紙', '牛皮紙', '紙袋'],
    en: ['paper packaging', 'cardboard box', 'corrugated', 'paperboard', 'kraft paper', 'paper bag']
  },
  'packaging-structure': {
    zh: ['包裝結構', '盒型設計', '折疊紙盒', '禮盒結構', '開窗設計'],
    en: ['packaging structure', 'box design', 'folding carton', 'gift box structure', 'window design']
  },
  'printing-process': {
    zh: ['印刷工藝', '燙金', '壓紋', 'UV 印刷', '數位印刷', '柔版印刷'],
    en: ['printing process', 'foil stamping', 'embossing', 'UV printing', 'digital printing', 'flexography']
  },
  'material-innovation': {
    zh: ['包裝材料', '新材料', '生物基材料', '可回收材料', '阻隔材料'],
    en: ['packaging materials', 'new materials', 'bio-based materials', 'recyclable materials', 'barrier materials']
  },
  'sustainability': {
    zh: ['永續包裝', '環保包裝', '可堆肥', '減塑', 'FSC 認證', '碳足跡'],
    en: ['sustainable packaging', 'eco-friendly packaging', 'compostable', 'plastic reduction', 'FSC certified', 'carbon footprint']
  },
  'market-trends': {
    zh: ['包裝趨勢', '市場分析', '產業報告', '消費者行為', '電商包裝'],
    en: ['packaging trends', 'market analysis', 'industry report', 'consumer behavior', 'e-commerce packaging']
  },
  'b2b-packaging': {
    zh: ['B2B 包裝', '企業包裝', '品牌包裝', '客製化包裝', '代工'],
    en: ['B2B packaging', 'corporate packaging', 'brand packaging', 'custom packaging', 'OEM']
  }
};
