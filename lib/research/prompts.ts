// lib/research/prompts.ts
// 研究系統提示詞模板

import { FocusArea, FOCUS_AREA_KEYWORDS, WritingStyle, DEFAULT_WRITING_STYLE } from './types';

// 研究收集系統提示
export const RESEARCH_COLLECTION_SYSTEM_PROMPT = `你是一位專業的包裝產業研究分析師，專注於紙類包裝、印刷加工、材料創新和 B2B 包裝市場趨勢。

你的任務是協助人類研究員收集和分析包裝產業的最新趨勢、技術發展和市場動態。

核心原則：
1. 專注於原創性高、權威性強的資訊來源
2. 避免行銷導向的內容
3. 重視產業報告、學術研究、技術白皮書
4. 東西方市場動態並重
5. 所有分析必須有來源支撐

你不是在寫文章，你是在做研究。你的輸出將供人類研究員審核和決策。`;

// 來源分析提示
export function buildSourceAnalysisPrompt(url: string, content: string, focusAreas: FocusArea[]): string {
  const keywords = focusAreas.map(area => FOCUS_AREA_KEYWORDS[area]).flat();
  
  return `請分析以下網頁內容，評估其作為包裝產業研究來源的品質。

URL: ${url}

內容摘要：
${content.slice(0, 5000)}

請評估以下維度（0-100分）：

1. **權威性 (Authority)**：
   - 來源是否為產業權威機構？
   - 作者是否具備專業背景？
   - 是否有引用其他權威來源？

2. **原創性 (Originality)**：
   - 內容是否為原創研究/分析？
   - 是否提供獨特見解而非轉載？

3. **相關性 (Relevance)**：
   - 與紙類包裝產業的相關程度
   - 聚焦領域關鍵詞：${keywords.join(', ')}

4. **行銷導向檢測**：
   - 內容是否主要為推銷產品/服務？
   - 是否有明顯的商業偏見？

請以 JSON 格式輸出：
{
  "authorityScore": number,
  "originalityScore": number,
  "relevanceScore": number,
  "isMarketing": boolean,
  "sourceType": "INDUSTRY_REPORT" | "ACADEMIC_PAPER" | "TRADE_NEWS" | "MANUFACTURER_BLOG" | "CONFERENCE" | "PATENT" | "CASE_STUDY" | "MARKET_ANALYSIS" | "OTHER",
  "summary": "100字以內的內容摘要",
  "keyPoints": ["關鍵要點1", "關鍵要點2", ...],
  "reasoning": "評估理由說明"
}`;
}

// 模組生成提示
export function buildModuleGenerationPrompt(
  sources: { title: string; summary: string; keyPoints: string[] }[],
  focusAreas: FocusArea[]
): string {
  const sourcesText = sources.map((s, i) => 
    `來源 ${i + 1}: ${s.title}\n摘要: ${s.summary}\n要點: ${s.keyPoints.join('; ')}`
  ).join('\n\n');

  return `基於以下研究來源，請生成結構化的研究模組。

研究來源：
${sourcesText}

聚焦領域：${focusAreas.join(', ')}

請為每個可識別的主題/趨勢生成一個研究模組。每個模組必須包含：

1. **模組類型** (moduleType)：
   - TREND: 趨勢模組
   - MATERIAL: 材料模組
   - STRUCTURE: 結構模組
   - PROCESS: 技術/加工模組
   - CASE: 案例模組
   - MARKET_INSIGHT: 市場觀察模組
   - SUSTAINABILITY: 永續/環保模組
   - INNOVATION: 創新模組
   - REGULATION: 法規模組

2. **標題** (title_zh, title_en)：簡潔明確的模組標題

3. **核心結論** (conclusion_zh, conclusion_en)：
   - 150-200字的核心發現
   - 必須有來源支撐
   - 避免主觀臆測

4. **觀點摘要** (insight_zh, insight_en)：
   - 50-80字的可引用觀點
   - 適合直接用於文章

5. **標籤** (tags)：3-5個相關標籤

6. **支撐來源索引** (sourceIndexes)：引用的來源編號

請以 JSON 陣列格式輸出：
[
  {
    "moduleType": "TREND",
    "title_zh": "...",
    "title_en": "...",
    "conclusion_zh": "...",
    "conclusion_en": "...",
    "insight_zh": "...",
    "insight_en": "...",
    "tags": ["tag1", "tag2"],
    "sourceIndexes": [1, 2]
  },
  ...
]

注意：只生成有充分來源支撐的模組，寧精勿濫。`;
}

// 寫作協助提示
export function buildWritingAssistancePrompt(
  modules: { title_zh: string; conclusion_zh: string; insight_zh: string }[],
  outline: { title: string; sections: { heading: string; description: string }[] },
  style: WritingStyle = DEFAULT_WRITING_STYLE
): string {
  const modulesText = modules.map((m, i) => 
    `模組 ${i + 1}: ${m.title_zh}\n結論: ${m.conclusion_zh}\n觀點: ${m.insight_zh}`
  ).join('\n\n');

  const sectionsText = outline.sections.map((s, i) =>
    `第${i + 1}節: ${s.heading}\n說明: ${s.description}`
  ).join('\n');

  return `請基於以下研究模組，協助撰寫一篇專業的包裝產業文章。

## 研究模組
${modulesText}

## 文章大綱
標題：${outline.title}
${sectionsText}

## 寫作風格要求
- 語調：${style.tone === 'professional' ? '專業' : style.tone === 'analytical' ? '分析性' : '資訊性'}
- 正式程度：${style.formality === 'formal' ? '正式' : '半正式'}
- 視角：${style.perspective === 'third-person' ? '第三人稱' : '第一人稱複數'}
- 目標讀者：${style.targetAudience}

## 寫作原則
1. 語言：繁體中文
2. 長度：1200-1800字
3. 風格：專業、冷靜、有洞察，像產業研究報告
4. 禁止：行銷語言、誇大描述、無根據的預測
5. 必須：所有論點都有模組支撐

## 輸出格式
請以 Markdown 格式輸出完整文章，包含：
- 標題（H1）
- 各節標題（H2）
- 適當的段落分隔
- 必要時使用列表或表格

重要：這是草稿，將由人類編輯審核和修改。請標註任何需要人類補充或確認的部分。`;
}

// 對話研究提示
export function buildConversationSystemPrompt(
  modules: { id: string; title_zh: string; conclusion_zh: string; moduleType: string }[]
): string {
  const modulesContext = modules.map(m => 
    `[${m.id}] ${m.moduleType}: ${m.title_zh}\n${m.conclusion_zh}`
  ).join('\n\n');

  return `你是一位包裝產業研究助理，正在協助人類研究員進行深度研究分析。

目前的研究模組庫：
${modulesContext}

你的角色：
1. 回答關於研究模組的問題
2. 協助比較和分析不同模組
3. 建議研究方向和文章角度
4. 協助重組模組內容

重要原則：
- 所有回答必須基於現有模組
- 如需新資料，請明確標記為「建議」
- 你的輸出是草稿，最終決策權在人類
- 引用模組時請註明模組 ID

不要主動生成新的觀點或結論，除非人類明確要求。`;
}

// 主題建議提示
export function buildTopicSuggestionPrompt(
  modules: { title_zh: string; moduleType: string; tags: string[] }[]
): string {
  const modulesText = modules.map(m => 
    `${m.moduleType}: ${m.title_zh} [${m.tags.join(', ')}]`
  ).join('\n');

  return `基於以下研究模組，請建議可能值得深入的研究主題或文章角度。

現有模組：
${modulesText}

請提供 3-5 個建議，每個建議包含：
1. 主題標題
2. 可使用的模組類型
3. 為什麼值得深入（50字以內）
4. 建議的研究方向

請以 JSON 格式輸出：
[
  {
    "topic": "主題標題",
    "relevantModuleTypes": ["TREND", "MATERIAL"],
    "rationale": "為什麼值得深入",
    "researchDirection": "建議的研究方向"
  }
]

注意：這些只是建議，人類研究員將決定是否採納。`;
}
