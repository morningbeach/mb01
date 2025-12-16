// lib/research/writing/enhanced-article-generator.ts
// 增強版文章生成器 - 支援視覺化、嚴格引用、自動配圖

import { prisma } from '@/lib/prisma';
import { aiOrchestrator } from '../ai-orchestrator';

export interface EnhancedArticleOptions {
  sessionId: string;
  moduleIds: string[];
  articleType: 'trend' | 'guide' | 'case-study' | 'material' | 'comparison';
  title?: string;
  // 新增選項
  enableVisualization: boolean;      // 啟用研究視覺化
  enableStrictCitations: boolean;    // 啟用嚴格引用
  enableAutoImages: boolean;         // 啟用自動配圖
  imageStyle?: 'professional' | 'creative' | 'minimal';  // 圖片風格
  citationStyle?: 'inline' | 'footnote' | 'endnote';     // 引用風格
}

export interface ArticleCitation {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  authorityScore: number;
  quotedText: string;
  context: string;
  position: number;  // 在文章中的位置
}

export interface ArticleVisualization {
  id: string;
  type: 'bar-chart' | 'pie-chart' | 'timeline' | 'comparison-table' | 'flow-chart' | 'stats-card';
  title: string;
  data: any;
  position: string;  // 在哪個章節後
  caption?: string;
}

export interface ArticleImage {
  id: string;
  prompt: string;           // AI 生成提示
  position: string;         // 在哪個章節後
  alt: string;
  caption?: string;
  suggestedQuery?: string;  // 圖片搜尋建議
  type: 'ai-generated' | 'stock-search' | 'placeholder';
}

export interface EnhancedGeneratedArticle {
  title_zh: string;
  content_zh: string;
  excerpt_zh: string;
  tags: string[];
  wordCount: number;
  // 增強功能
  citations: ArticleCitation[];
  visualizations: ArticleVisualization[];
  images: ArticleImage[];
  // 完整版 Markdown（含所有標記）
  fullMarkdown: string;
  // 引用區塊
  referenceSection: string;
}

export class EnhancedArticleGenerator {

  // 生成增強版文章
  async generate(options: EnhancedArticleOptions): Promise<EnhancedGeneratedArticle> {
    const {
      sessionId,
      moduleIds,
      articleType,
      title,
      enableVisualization,
      enableStrictCitations,
      enableAutoImages,
      citationStyle = 'inline',
      imageStyle = 'professional'
    } = options;

    // 獲取模組及其來源
    const modules = await prisma.researchModule.findMany({
      where: { id: { in: moduleIds } },
      include: {
        sources: {
          include: { source: true }
        }
      }
    });

    if (modules.length === 0) {
      throw new Error('找不到研究模組');
    }

    // 獲取 session
    const session = await prisma.researchSession.findUnique({
      where: { id: sessionId }
    });

    const topic = title || session?.topic || modules[0].title_zh;

    // 收集所有來源資訊
    const allSources = new Map<string, any>();
    modules.forEach(m => {
      m.sources?.forEach(ms => {
        if (ms.source) {
          allSources.set(ms.source.id, ms.source);
        }
      });
    });

    // 生成文章內容（含引用標記）
    const articlePrompt = this.buildEnhancedPrompt(
      topic,
      modules,
      Array.from(allSources.values()),
      {
        articleType,
        enableVisualization,
        enableStrictCitations,
        citationStyle
      }
    );

    const articleResult = await aiOrchestrator.execute(
      'WRITING_ASSISTANCE',
      this.getEnhancedSystemPrompt(enableStrictCitations, enableVisualization),
      articlePrompt,
      { preferQuality: true, temperature: 0.5 }
    );

    let content_zh = articleResult.content;
    const title_zh = this.extractTitle(content_zh) || topic;
    
    // 解析引用
    const citations = enableStrictCitations 
      ? this.extractCitations(content_zh, Array.from(allSources.values()))
      : [];

    // 生成視覺化建議
    const visualizations = enableVisualization
      ? await this.generateVisualizations(topic, modules, content_zh)
      : [];

    // 生成圖片建議
    const images = enableAutoImages
      ? await this.generateImageSuggestions(topic, content_zh, imageStyle)
      : [];

    // 生成引用區塊
    const referenceSection = this.buildReferenceSection(citations, citationStyle);

    // 組合完整 Markdown
    const fullMarkdown = this.buildFullMarkdown(
      content_zh,
      citations,
      visualizations,
      images,
      referenceSection,
      citationStyle
    );

    // 計算字數和生成摘要
    const wordCount = this.countWords(content_zh);
    const excerpt_zh = this.generateExcerpt(content_zh);
    const tags = this.collectTags(modules);

    return {
      title_zh,
      content_zh,
      excerpt_zh,
      tags,
      wordCount,
      citations,
      visualizations,
      images,
      fullMarkdown,
      referenceSection
    };
  }

  // 建構增強版提示詞
  private buildEnhancedPrompt(
    topic: string,
    modules: any[],
    sources: any[],
    options: {
      articleType: string;
      enableVisualization: boolean;
      enableStrictCitations: boolean;
      citationStyle: string;
    }
  ): string {
    const modulesSummary = modules.map((m, i) => `
### 模組 ${i + 1}: ${m.title_zh} [${m.moduleType}]
結論: ${m.conclusion_zh}
${m.insight_zh ? `洞察: ${m.insight_zh}` : ''}
來源ID: ${m.sources?.map((s: any) => s.source?.id).filter(Boolean).join(', ')}
`).join('\n');

    const sourcesList = sources.map((s, i) => `
[S${i + 1}] ${s.title}
- ID: ${s.id}
- URL: ${s.url}
- 權威分數: ${s.authorityScore}
- 摘要: ${s.summary?.slice(0, 150) || '無摘要'}
- 關鍵點: ${Array.isArray(s.keyPoints) ? s.keyPoints.slice(0, 3).join('; ') : '無'}
`).join('\n');

    let citationInstructions = '';
    if (options.enableStrictCitations) {
      citationInstructions = `
## 嚴格引用要求
1. 每一個事實陳述、數據、趨勢判斷都必須標註來源
2. 使用格式: [來源標題](來源URL){#來源ID}
3. 直接引用時使用: > "引用內容" — 來源標題
4. 數據引用格式: 根據[來源標題]{#ID}，某數據為...
5. 不可憑空捏造數據或事實
6. 每個段落至少要有一個引用
`;
    }

    let visualizationInstructions = '';
    if (options.enableVisualization) {
      visualizationInstructions = `
## 視覺化建議
在適當位置插入視覺化標記:
- 統計數據: <!-- CHART:bar|標題|數據描述 -->
- 比較內容: <!-- CHART:comparison|標題|項目描述 -->
- 時間軸: <!-- CHART:timeline|標題|事件描述 -->
- 流程: <!-- CHART:flow|標題|步驟描述 -->
- 重點數據: <!-- STATS:數字|說明 -->
`;
    }

    return `請為主題「${topic}」撰寫一篇專業的包裝產業文章。

## 文章類型
${options.articleType}

## 研究模組（必須引用）
${modulesSummary}

## 可引用來源
${sourcesList}

${citationInstructions}
${visualizationInstructions}

## 寫作要求
1. 標題使用 # 開頭
2. 章節使用 ## 開頭
3. 結構清晰，邏輯嚴謹
4. 1500-2500 字
5. 使用繁體中文（台灣用語）
6. 專業但易讀
7. 每個論點必須有來源支撐

請開始撰寫：`;
  }

  // 增強版系統提示
  private getEnhancedSystemPrompt(strictCitations: boolean, visualization: boolean): string {
    let base = `你是一位專業的包裝產業研究作家，專精於將研究模組轉化為高品質文章。

核心原則:
- 所有內容必須基於提供的研究模組
- 使用繁體中文（台灣用語）
- 專業但不失易讀性`;

    if (strictCitations) {
      base += `
- 嚴格標註每個事實的來源
- 使用 [來源標題](URL){#ID} 格式引用
- 不可憑空捏造數據`;
    }

    if (visualization) {
      base += `
- 在適合的地方建議插入圖表
- 使用 <!-- CHART:類型|標題|數據 --> 標記`;
    }

    return base;
  }

  // 從文章中提取引用
  private extractCitations(content: string, sources: any[]): ArticleCitation[] {
    const citations: ArticleCitation[] = [];
    
    // 匹配引用格式: [標題](URL){#ID} 或 {#ID}
    const citationPattern = /\[([^\]]+)\]\(([^)]+)\)\{#([^}]+)\}|\{#([^}]+)\}/g;
    let match;
    let position = 0;

    while ((match = citationPattern.exec(content)) !== null) {
      const sourceId = match[3] || match[4];
      const source = sources.find(s => s.id === sourceId || s.id.includes(sourceId));
      
      if (source) {
        // 提取引用上下文（前後 50 字元）
        const start = Math.max(0, match.index - 50);
        const end = Math.min(content.length, match.index + match[0].length + 50);
        const context = content.slice(start, end);

        citations.push({
          id: `cite_${position + 1}`,
          sourceId: source.id,
          sourceTitle: source.title,
          sourceUrl: source.url,
          authorityScore: source.authorityScore,
          quotedText: match[1] || '',
          context: context.replace(/\n/g, ' '),
          position: position++
        });
      }
    }

    // 也匹配直接引用格式: > "..." — 來源
    const quotePattern = />\s*"([^"]+)"\s*—\s*([^\n]+)/g;
    while ((match = quotePattern.exec(content)) !== null) {
      const quotedText = match[1];
      const sourceTitle = match[2].trim();
      const source = sources.find(s => 
        s.title?.includes(sourceTitle) || sourceTitle.includes(s.title)
      );

      if (source) {
        citations.push({
          id: `cite_${position + 1}`,
          sourceId: source.id,
          sourceTitle: source.title,
          sourceUrl: source.url,
          authorityScore: source.authorityScore,
          quotedText,
          context: match[0],
          position: position++
        });
      }
    }

    return citations;
  }

  // 生成視覺化建議
  private async generateVisualizations(
    topic: string,
    modules: any[],
    content: string
  ): Promise<ArticleVisualization[]> {
    const visualizations: ArticleVisualization[] = [];

    // 從內容中提取已標記的視覺化
    const chartPattern = /<!--\s*CHART:(\w+)\|([^|]+)\|([^>]+)\s*-->/g;
    let match;
    let id = 1;

    while ((match = chartPattern.exec(content)) !== null) {
      const type = match[1] as ArticleVisualization['type'];
      const title = match[2].trim();
      const dataDesc = match[3].trim();

      visualizations.push({
        id: `viz_${id++}`,
        type: this.mapChartType(type),
        title,
        data: { description: dataDesc },
        position: `after_${match.index}`
      });
    }

    // 從內容中提取統計數據卡片
    const statsPattern = /<!--\s*STATS:([^|]+)\|([^>]+)\s*-->/g;
    while ((match = statsPattern.exec(content)) !== null) {
      visualizations.push({
        id: `viz_${id++}`,
        type: 'stats-card',
        title: match[2].trim(),
        data: { value: match[1].trim(), label: match[2].trim() },
        position: `after_${match.index}`
      });
    }

    // 如果沒有標記，自動分析生成建議
    if (visualizations.length === 0) {
      const autoViz = await this.analyzeForVisualizations(modules);
      visualizations.push(...autoViz);
    }

    return visualizations;
  }

  // 自動分析生成視覺化建議
  private async analyzeForVisualizations(modules: any[]): Promise<ArticleVisualization[]> {
    const visualizations: ArticleVisualization[] = [];

    // 基於模組類型生成建議
    const moduleTypes = modules.map(m => m.moduleType);
    
    // 趨勢模組 -> 時間軸
    if (moduleTypes.includes('TREND')) {
      const trendModules = modules.filter(m => m.moduleType === 'TREND');
      visualizations.push({
        id: 'viz_trend_timeline',
        type: 'timeline',
        title: '趨勢發展時間軸',
        data: {
          events: trendModules.map(m => ({
            title: m.title_zh,
            description: m.insight_zh || m.conclusion_zh?.slice(0, 100)
          }))
        },
        position: 'after_intro',
        caption: '主要趨勢發展歷程'
      });
    }

    // 材料模組 -> 比較表
    if (moduleTypes.includes('MATERIAL')) {
      const materialModules = modules.filter(m => m.moduleType === 'MATERIAL');
      if (materialModules.length >= 2) {
        visualizations.push({
          id: 'viz_material_comparison',
          type: 'comparison-table',
          title: '材料特性比較',
          data: {
            items: materialModules.map(m => ({
              name: m.title_zh,
              features: m.tags || []
            }))
          },
          position: 'after_material_section'
        });
      }
    }

    // 市場洞察 -> 統計卡片
    if (moduleTypes.includes('MARKET_INSIGHT')) {
      const marketModules = modules.filter(m => m.moduleType === 'MARKET_INSIGHT');
      marketModules.forEach((m, i) => {
        visualizations.push({
          id: `viz_market_${i}`,
          type: 'stats-card',
          title: m.title_zh,
          data: {
            insight: m.insight_zh || m.conclusion_zh?.slice(0, 50)
          },
          position: 'sidebar'
        });
      });
    }

    return visualizations;
  }

  // 生成圖片建議
  private async generateImageSuggestions(
    topic: string,
    content: string,
    style: string
  ): Promise<ArticleImage[]> {
    const images: ArticleImage[] = [];
    const sections = content.split(/^##\s+/gm).filter(s => s.trim());

    // 封面圖
    images.push({
      id: 'img_cover',
      type: 'ai-generated',
      position: 'cover',
      prompt: this.buildImagePrompt(topic, 'cover', style),
      alt: topic,
      caption: topic,
      suggestedQuery: `${topic} packaging design professional`
    });

    // 為每個主要章節建議圖片
    sections.slice(0, 4).forEach((section, i) => {
      const heading = section.split('\n')[0]?.trim() || `章節 ${i + 1}`;
      const sectionContent = section.slice(0, 200);

      images.push({
        id: `img_section_${i + 1}`,
        type: 'ai-generated',
        position: `after_section_${i + 1}`,
        prompt: this.buildImagePrompt(heading, 'section', style, sectionContent),
        alt: heading,
        caption: heading,
        suggestedQuery: `${heading} packaging ${topic}`
      });
    });

    return images;
  }

  // 建構圖片生成提示
  private buildImagePrompt(
    subject: string,
    type: 'cover' | 'section',
    style: string,
    context?: string
  ): string {
    const styleGuides: Record<string, string> = {
      professional: 'clean, minimalist, corporate style, white background, high-end product photography',
      creative: 'artistic, colorful, dynamic composition, creative packaging design showcase',
      minimal: 'simple, elegant, single subject, clean background, subtle shadows'
    };
    
    const styleGuide = styleGuides[style] || styleGuides.professional;

    if (type === 'cover') {
      return `Professional packaging industry illustration: ${subject}. ${styleGuide}. B2B business context, modern packaging solutions, no text, 16:9 aspect ratio.`;
    }

    return `Packaging design illustration for: ${subject}. ${styleGuide}. ${context ? `Context: ${context.slice(0, 100)}` : ''}. Clean composition, product-focused, no text.`;
  }

  // 建構引用區塊
  private buildReferenceSection(
    citations: ArticleCitation[],
    style: string
  ): string {
    if (citations.length === 0) return '';

    // 去重
    const uniqueSources = new Map<string, ArticleCitation>();
    citations.forEach(c => {
      if (!uniqueSources.has(c.sourceId)) {
        uniqueSources.set(c.sourceId, c);
      }
    });

    const sources = Array.from(uniqueSources.values());
    
    let section = '\n\n---\n\n## 📚 參考資料\n\n';
    
    sources.forEach((c, i) => {
      const authorityBadge = c.authorityScore >= 80 ? '⭐' : 
                            c.authorityScore >= 60 ? '✓' : '';
      section += `${i + 1}. ${authorityBadge} [${c.sourceTitle}](${c.sourceUrl}) — 權威分數: ${c.authorityScore}/100\n`;
    });

    section += '\n\n> 本文所有資料均來自上述來源，經 AI 整合分析後撰寫。\n';

    return section;
  }

  // 組合完整 Markdown
  private buildFullMarkdown(
    content: string,
    citations: ArticleCitation[],
    visualizations: ArticleVisualization[],
    images: ArticleImage[],
    referenceSection: string,
    citationStyle: string
  ): string {
    let markdown = content;

    // 清理視覺化標記（替換為實際組件標記）
    markdown = markdown.replace(
      /<!--\s*CHART:(\w+)\|([^|]+)\|([^>]+)\s*-->/g,
      (_, type, title, data) => `\n\n:::chart{type="${type}" title="${title}"}\n${data}\n:::\n\n`
    );

    markdown = markdown.replace(
      /<!--\s*STATS:([^|]+)\|([^>]+)\s*-->/g,
      (_, value, label) => `\n\n:::stats{value="${value}"}\n${label}\n:::\n\n`
    );

    // 添加圖片佔位符
    const coverImage = images.find(i => i.position === 'cover');
    if (coverImage) {
      const titleMatch = markdown.match(/^#\s+.+$/m);
      if (titleMatch) {
        const insertPos = titleMatch.index! + titleMatch[0].length;
        markdown = markdown.slice(0, insertPos) + 
          `\n\n:::image{id="${coverImage.id}" alt="${coverImage.alt}"}\n${coverImage.prompt}\n:::\n` +
          markdown.slice(insertPos);
      }
    }

    // 添加引用區塊
    markdown += referenceSection;

    // 添加視覺化摘要
    if (visualizations.length > 0) {
      markdown += '\n\n---\n\n## 📊 視覺化元素\n\n';
      markdown += '本文包含以下視覺化元素：\n\n';
      visualizations.forEach((v, i) => {
        markdown += `${i + 1}. **${v.title}** (${this.getChartTypeLabel(v.type)})\n`;
      });
    }

    // 添加圖片建議
    if (images.length > 0) {
      markdown += '\n\n---\n\n## 🖼️ 建議配圖\n\n';
      images.forEach((img, i) => {
        markdown += `${i + 1}. **${img.alt}** (${img.position})\n`;
        markdown += `   - AI 提示: ${img.prompt.slice(0, 100)}...\n`;
        markdown += `   - 搜尋建議: ${img.suggestedQuery}\n\n`;
      });
    }

    return markdown;
  }

  // 輔助函數
  private mapChartType(type: string): ArticleVisualization['type'] {
    const mapping: Record<string, ArticleVisualization['type']> = {
      bar: 'bar-chart',
      pie: 'pie-chart',
      timeline: 'timeline',
      comparison: 'comparison-table',
      flow: 'flow-chart',
      stats: 'stats-card'
    };
    return mapping[type] || 'bar-chart';
  }

  private getChartTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'bar-chart': '長條圖',
      'pie-chart': '圓餅圖',
      'timeline': '時間軸',
      'comparison-table': '比較表',
      'flow-chart': '流程圖',
      'stats-card': '統計卡片'
    };
    return labels[type] || type;
  }

  private extractTitle(content: string): string {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : '';
  }

  private generateExcerpt(content: string, maxLength: number = 200): string {
    const text = content
      .replace(/^#.+$/gm, '')
      .replace(/<!--[^>]+-->/g, '')
      .replace(/:::[^:]+:::/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\{#[^}]+\}/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  }

  private collectTags(modules: any[]): string[] {
    const allTags = modules.flatMap(m => m.tags || []);
    return [...new Set(allTags)].slice(0, 10);
  }

  private countWords(content: string): number {
    const cleanContent = content.replace(/<!--[^>]+-->/g, '').replace(/:::[^:]+:::/g, '');
    const chineseChars = cleanContent.match(/[\u4e00-\u9fff]/g) || [];
    const englishWords = cleanContent.match(/[a-zA-Z]+/g) || [];
    return chineseChars.length + englishWords.length;
  }
}

export const enhancedArticleGenerator = new EnhancedArticleGenerator();
