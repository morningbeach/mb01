// lib/research/core/citation-scorer.ts
// 引用推薦評分系統 - 計算每個來源在模組中的引用價值

import { SourceType } from '../engines/analysis-engine';

// 來源類型權重
const SOURCE_TYPE_WEIGHTS: Record<string, number> = {
  'INDUSTRY_REPORT': 100,   // 產業報告 - 最高權威
  'ACADEMIC_PAPER': 95,     // 學術論文
  'MARKET_ANALYSIS': 90,    // 市場分析
  'CASE_STUDY': 85,         // 案例研究
  'CONFERENCE': 80,         // 研討會
  'TRADE_NEWS': 70,         // 產業新聞
  'TUTORIAL': 50,           // 教程
  'MANUFACTURER_BLOG': 40,  // 廠商部落格
  'OTHER': 30               // 其他
};

// 區域權重（針對不同市場）
const REGION_WEIGHTS: Record<string, number> = {
  'tw': 100,      // 台灣市場 - 本地優先
  'asia': 90,     // 亞洲
  'global': 80,   // 全球
  'europe': 70,   // 歐洲
  'americas': 70  // 美洲
};

export interface SourceForScoring {
  id: string;
  url: string;
  title: string;
  authorityScore: number;
  originalityScore: number;
  relevanceScore: number;
  sourceType: string;
  region: string;
  language: string;
  keyPoints: string[];
  summary?: string | null;
}

export interface CitationRecommendation {
  sourceId: string;
  citationScore: number;        // 0-100 引用推薦分數
  citationReason: string;       // 推薦原因
  citationPriority: 'high' | 'medium' | 'low';  // 引用優先級
  suggestedUsage: string;       // 建議使用方式
}

/**
 * 計算來源的引用推薦分數
 */
export function calculateCitationScore(
  source: SourceForScoring,
  moduleType: string,
  moduleTags: string[]
): CitationRecommendation {
  // 1. 基礎分數：權威性 * 0.35 + 原創性 * 0.25 + 相關性 * 0.40
  const baseScore = 
    source.authorityScore * 0.35 +
    source.originalityScore * 0.25 +
    source.relevanceScore * 0.40;
  
  // 2. 來源類型加成
  const typeWeight = SOURCE_TYPE_WEIGHTS[source.sourceType] || 30;
  const typeBonus = (typeWeight - 50) / 5;  // -4 到 +10 的加成
  
  // 3. 區域相關性加成
  const regionWeight = REGION_WEIGHTS[source.region] || 50;
  const regionBonus = (regionWeight - 50) / 10;  // -2 到 +5 的加成
  
  // 4. 內容豐富度加成
  const contentRichnessBonus = Math.min(
    (source.keyPoints?.length || 0) * 2,  // 每個關鍵點 +2，最多 +10
    10
  );
  
  // 5. 計算最終分數
  let finalScore = Math.round(
    baseScore + typeBonus + regionBonus + contentRichnessBonus
  );
  
  // 限制在 0-100 範圍
  finalScore = Math.max(0, Math.min(100, finalScore));
  
  // 6. 生成推薦原因
  const reasons: string[] = [];
  
  if (source.authorityScore >= 70) {
    reasons.push('高權威來源');
  }
  if (source.originalityScore >= 70) {
    reasons.push('原創性內容');
  }
  if (source.relevanceScore >= 80) {
    reasons.push('高度相關');
  }
  if (typeWeight >= 80) {
    reasons.push(getSourceTypeLabel(source.sourceType));
  }
  if ((source.keyPoints?.length || 0) >= 3) {
    reasons.push('內容豐富');
  }
  
  const citationReason = reasons.length > 0 
    ? reasons.join('、') 
    : '一般參考來源';
  
  // 7. 決定優先級
  let citationPriority: 'high' | 'medium' | 'low';
  if (finalScore >= 75) {
    citationPriority = 'high';
  } else if (finalScore >= 50) {
    citationPriority = 'medium';
  } else {
    citationPriority = 'low';
  }
  
  // 8. 建議使用方式
  const suggestedUsage = getSuggestedUsage(source.sourceType, finalScore);
  
  return {
    sourceId: source.id,
    citationScore: finalScore,
    citationReason,
    citationPriority,
    suggestedUsage
  };
}

/**
 * 批次計算所有來源的引用分數
 */
export function calculateAllCitationScores(
  sources: SourceForScoring[],
  moduleType: string,
  moduleTags: string[]
): CitationRecommendation[] {
  return sources
    .map(source => calculateCitationScore(source, moduleType, moduleTags))
    .sort((a, b) => b.citationScore - a.citationScore);  // 按分數降序排列
}

/**
 * 取得來源類型中文標籤
 */
function getSourceTypeLabel(sourceType: string): string {
  const labels: Record<string, string> = {
    'INDUSTRY_REPORT': '產業報告',
    'ACADEMIC_PAPER': '學術論文',
    'MARKET_ANALYSIS': '市場分析',
    'CASE_STUDY': '案例研究',
    'CONFERENCE': '研討會資料',
    'TRADE_NEWS': '產業新聞',
    'TUTORIAL': '教程內容',
    'MANUFACTURER_BLOG': '廠商資訊',
    'OTHER': '其他來源'
  };
  return labels[sourceType] || sourceType;
}

/**
 * 根據來源類型和分數建議使用方式
 */
function getSuggestedUsage(sourceType: string, score: number): string {
  if (score >= 80) {
    switch (sourceType) {
      case 'INDUSTRY_REPORT':
      case 'ACADEMIC_PAPER':
        return '可作為主要引用依據，適合用於文章核心論點';
      case 'MARKET_ANALYSIS':
        return '適合引用市場數據和趨勢分析';
      case 'CASE_STUDY':
        return '可作為實際案例引用，增強說服力';
      default:
        return '建議優先引用';
    }
  } else if (score >= 60) {
    switch (sourceType) {
      case 'TRADE_NEWS':
        return '可引用新聞事件或產業動態';
      case 'CONFERENCE':
        return '可引用專家觀點或技術資訊';
      default:
        return '可作為補充參考';
    }
  } else {
    return '建議作為背景資料，謹慎引用';
  }
}

/**
 * 取得引用優先級的顯示樣式
 */
export function getCitationPriorityStyle(priority: string): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (priority) {
    case 'high':
      return { label: '強烈推薦', color: 'text-green-700', bgColor: 'bg-green-100' };
    case 'medium':
      return { label: '建議引用', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    case 'low':
      return { label: '可選參考', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    default:
      return { label: '未評估', color: 'text-gray-500', bgColor: 'bg-gray-50' };
  }
}
