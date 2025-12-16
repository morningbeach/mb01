// lib/research/writing/style-guide.ts
// MB Pack / 清晨製袋 風格指南

export interface WritingStyle {
  tone: 'professional' | 'friendly' | 'analytical';
  perspective: 'third-person' | 'first-person-plural';
  formality: 'formal' | 'semi-formal';
  targetAudience: string;
  characteristics: string[];
}

export interface ArticleTemplate {
  type: 'trend' | 'guide' | 'case-study' | 'material' | 'comparison';
  structure: ArticleSection[];
  wordCountRange: { min: number; max: number };
  style: WritingStyle;
}

export interface ArticleSection {
  name: string;
  purpose: string;
  wordCount: { min: number; max: number };
  required: boolean;
}

// 基於 dawnbags.com 風格分析
export const DAWNBAGS_STYLE: WritingStyle = {
  tone: 'friendly',
  perspective: 'first-person-plural',
  formality: 'semi-formal',
  targetAudience: 'B2B 採購決策者、品牌經理、行銷人員',
  characteristics: [
    '標題使用問句或懸念吸引讀者',
    '開頭直接點出讀者的痛點或疑問',
    '內容結構清晰，使用小標題分段',
    '適度穿插專業術語，但要解釋清楚',
    '結尾提供實用建議或行動呼籲',
    '語氣親切但不失專業',
    '善用列點整理重點',
    '適當引用數據和案例增加說服力'
  ]
};

// MB Pack 品牌風格
export const MBPACK_STYLE: WritingStyle = {
  tone: 'professional',
  perspective: 'third-person',
  formality: 'semi-formal',
  targetAudience: 'B2B 包裝採購、品牌經理、設計師',
  characteristics: [
    '專業冷靜的分析語調',
    '重視數據和事實支撐',
    '避免過度行銷語言',
    '提供可操作的建議',
    '雙語並重（繁中/英文）',
    '結構化的知識呈現',
    '適當引用產業報告',
    '注重實用性和可操作性'
  ]
};

// 文章模板
export const ARTICLE_TEMPLATES: Record<string, ArticleTemplate> = {
  trend: {
    type: 'trend',
    structure: [
      {
        name: '引言',
        purpose: '點出趨勢背景和重要性',
        wordCount: { min: 100, max: 200 },
        required: true
      },
      {
        name: '趨勢分析',
        purpose: '深入解析趨勢的成因和表現',
        wordCount: { min: 300, max: 500 },
        required: true
      },
      {
        name: '案例/數據',
        purpose: '用實例和數據佐證',
        wordCount: { min: 200, max: 400 },
        required: true
      },
      {
        name: '對品牌的影響',
        purpose: '說明趨勢對目標讀者的意義',
        wordCount: { min: 150, max: 300 },
        required: true
      },
      {
        name: '實用建議',
        purpose: '提供可操作的行動方案',
        wordCount: { min: 100, max: 200 },
        required: true
      }
    ],
    wordCountRange: { min: 1000, max: 1800 },
    style: MBPACK_STYLE
  },
  
  guide: {
    type: 'guide',
    structure: [
      {
        name: '問題導入',
        purpose: '點出讀者面臨的問題',
        wordCount: { min: 100, max: 150 },
        required: true
      },
      {
        name: '基礎知識',
        purpose: '建立必要的背景知識',
        wordCount: { min: 200, max: 400 },
        required: true
      },
      {
        name: '選擇指南',
        purpose: '分類說明各選項的優缺點',
        wordCount: { min: 400, max: 700 },
        required: true
      },
      {
        name: '決策框架',
        purpose: '提供決策的思考流程',
        wordCount: { min: 150, max: 300 },
        required: true
      },
      {
        name: '總結',
        purpose: '重點回顧和行動建議',
        wordCount: { min: 100, max: 150 },
        required: true
      }
    ],
    wordCountRange: { min: 1200, max: 2000 },
    style: MBPACK_STYLE
  },
  
  material: {
    type: 'material',
    structure: [
      {
        name: '材料介紹',
        purpose: '說明材料的來源和特性',
        wordCount: { min: 150, max: 250 },
        required: true
      },
      {
        name: '技術特點',
        purpose: '詳細說明材料的技術參數',
        wordCount: { min: 200, max: 400 },
        required: true
      },
      {
        name: '應用場景',
        purpose: '說明適合的應用場景',
        wordCount: { min: 200, max: 350 },
        required: true
      },
      {
        name: '優缺點比較',
        purpose: '客觀分析優缺點',
        wordCount: { min: 200, max: 350 },
        required: true
      },
      {
        name: '採購建議',
        purpose: '提供採購決策建議',
        wordCount: { min: 100, max: 200 },
        required: false
      }
    ],
    wordCountRange: { min: 1000, max: 1600 },
    style: MBPACK_STYLE
  },
  
  'case-study': {
    type: 'case-study',
    structure: [
      {
        name: '案例背景',
        purpose: '介紹品牌和挑戰',
        wordCount: { min: 100, max: 200 },
        required: true
      },
      {
        name: '解決方案',
        purpose: '說明採用的方案',
        wordCount: { min: 200, max: 400 },
        required: true
      },
      {
        name: '執行細節',
        purpose: '材料、工藝、設計細節',
        wordCount: { min: 200, max: 400 },
        required: true
      },
      {
        name: '成果展示',
        purpose: '量化或質化的成果',
        wordCount: { min: 150, max: 300 },
        required: true
      },
      {
        name: '經驗總結',
        purpose: '可複製的經驗',
        wordCount: { min: 100, max: 200 },
        required: true
      }
    ],
    wordCountRange: { min: 800, max: 1500 },
    style: DAWNBAGS_STYLE
  }
};

// 寫作提示詞模板
export function buildWritingPrompt(
  template: ArticleTemplate,
  topic: string,
  modules: { title: string; conclusion: string; insight: string }[],
  customInstructions?: string
): string {
  const structureGuide = template.structure.map((section, i) => 
    `${i + 1}. **${section.name}** (${section.wordCount.min}-${section.wordCount.max}字)\n   目的: ${section.purpose}`
  ).join('\n');

  const styleGuide = template.style.characteristics.map(c => `- ${c}`).join('\n');

  return `請基於以下研究模組，撰寫一篇關於「${topic}」的專業文章。

## 研究模組
${modules.map((m, i) => `
### 模組 ${i + 1}: ${m.title}
結論: ${m.conclusion}
觀點: ${m.insight}
`).join('')}

## 文章結構
${structureGuide}

## 寫作風格
語調: ${template.style.tone === 'professional' ? '專業分析' : template.style.tone === 'friendly' ? '親切實用' : '客觀分析'}
視角: ${template.style.perspective === 'third-person' ? '第三人稱' : '第一人稱複數（我們）'}
目標讀者: ${template.style.targetAudience}

風格特點:
${styleGuide}

## 字數要求
${template.wordCountRange.min}-${template.wordCountRange.max}字

## 特別注意
1. 使用繁體中文
2. 避免生硬的翻譯腔
3. 所有論點必須有模組支撐
4. 可適當引用模組中的數據
5. 禁止誇大或無根據的宣稱

${customInstructions ? `## 額外指示\n${customInstructions}` : ''}

請以 Markdown 格式輸出完整文章。`;
}

// 標題生成提示
export interface TitleSuggestion {
  title: string;
  angle: string;
  hook: string;
}

export function buildTitlePrompt(
  topic: string,
  modules: { title: string; moduleType: string }[],
  style: WritingStyle
): string {
  return `請為主題「${topic}」生成 5 個吸引人的文章標題。

研究模組:
${modules.map(m => `- [${m.moduleType}] ${m.title}`).join('\n')}

風格要求:
- 目標讀者: ${style.targetAudience}
- 語調: ${style.tone === 'professional' ? '專業' : style.tone === 'friendly' ? '親切' : '分析'}

參考標題風格（來自 dawnbags.com）:
- "環保是趨勢，但是您知道您需要的是哪種環保材質嗎？"
- "你所不知道的杜邦紙：1950 年代的一場意外"
- "銀色的魅力在哪？5 個關鍵讓它成為下一個包裝主角"
- "環保界的新寵兒：麗新布與寶特瓶回收材料的應用"

請生成 5 個標題建議，每個標題附帶角度說明和開場鉤子，以 JSON 陣列格式輸出:
[
  {
    "title": "標題文字",
    "angle": "這篇文章的切入角度說明",
    "hook": "文章開頭的吸引句"
  }
]`;
}
