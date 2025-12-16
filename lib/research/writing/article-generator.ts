// lib/research/writing/article-generator.ts
// 文章生成器 - 基於研究模組生成高質量文章

import { prisma } from '@/lib/prisma';
import { aiOrchestrator } from '../ai-orchestrator';
import { 
  ARTICLE_TEMPLATES, 
  MBPACK_STYLE, 
  DAWNBAGS_STYLE,
  buildWritingPrompt,
  buildTitlePrompt,
  ArticleTemplate,
  WritingStyle,
  TitleSuggestion
} from './style-guide';

export interface ArticleGenerationOptions {
  sessionId: string;
  moduleIds: string[];
  articleType: 'trend' | 'guide' | 'case-study' | 'material' | 'comparison';
  style?: 'mbpack' | 'dawnbags';
  customTitle?: string;
  customInstructions?: string;
  outline?: ArticleOutline;
  generateBilingual?: boolean;
}

export interface GeneratedArticle {
  title_zh: string;
  title_en?: string;
  content_zh: string;
  content_en?: string;
  excerpt_zh: string;
  excerpt_en?: string;
  metaDescription_zh?: string;
  metaDescription_en?: string;
  tags: string[];
  wordCount: number;
  moduleIds: string[];
  suggestedTitles: TitleSuggestion[];
}

export interface ArticleOutline {
  title: string;
  sections: {
    heading: string;
    moduleIds: string[];
    keyPoints: string[];
    estimatedWords: number;
  }[];
  totalEstimatedWords: number;
}

export class ArticleGenerator {
  
  // 生成標題建議
  async suggestTitles(
    sessionId: string,
    moduleIds: string[],
    style: 'mbpack' | 'dawnbags' = 'mbpack'
  ): Promise<TitleSuggestion[]> {
    const modules = await prisma.researchModule.findMany({
      where: { id: { in: moduleIds } }
    });
    
    if (modules.length === 0) {
      throw new Error('No modules found');
    }
    
    const session = await prisma.researchSession.findUnique({
      where: { id: sessionId }
    });
    
    const topic = session?.topic || modules[0].title_zh;
    const writingStyle = style === 'dawnbags' ? DAWNBAGS_STYLE : MBPACK_STYLE;
    
    const prompt = buildTitlePrompt(
      topic,
      modules.map(m => ({ title: m.title_zh, moduleType: m.moduleType })),
      writingStyle
    );
    
    const result = await aiOrchestrator.execute(
      'WRITING_ASSISTANCE',
      this.getSystemPrompt(),
      prompt,
      { temperature: 0.8 }
    );
    
    try {
      const titles = this.parseJsonResponse(result.content);
      if (Array.isArray(titles)) {
        // 確保每個項目都有正確的結構
        return titles.map(t => {
          if (typeof t === 'string') {
            return { title: t, angle: '', hook: '' };
          }
          return {
            title: t.title || '',
            angle: t.angle || '',
            hook: t.hook || ''
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  }

  // 生成文章大綱
  async generateOutline(
    sessionId: string,
    moduleIds: string[],
    options: {
      articleType?: string;
      style?: string;
      title?: string;
    } = {}
  ): Promise<ArticleOutline> {
    const { articleType = 'trend', style = 'mbpack', title: suggestedTitle } = options;
    
    const modules = await prisma.researchModule.findMany({
      where: { id: { in: moduleIds } }
    });
    
    const template = ARTICLE_TEMPLATES[articleType] || ARTICLE_TEMPLATES.trend;
    
    const prompt = `基於以下研究模組，請生成文章大綱。

研究模組:
${modules.map((m, i) => `${i + 1}. [${m.moduleType}] ${m.title_zh}\n   結論: ${m.conclusion_zh.substring(0, 150)}...`).join('\n\n')}

文章類型: ${articleType}
${suggestedTitle ? `建議標題: ${suggestedTitle}` : ''}

請生成大綱，以 JSON 格式輸出:
{
  "title": "文章標題",
  "sections": [
    {
      "heading": "章節標題",
      "moduleIndexes": [1, 2],
      "keyPoints": ["重點一", "重點二", "重點三"],
      "estimatedWords": 300
    }
  ],
  "totalEstimatedWords": 1500
}`;

    const result = await aiOrchestrator.execute(
      'WRITING_ASSISTANCE',
      this.getSystemPrompt(),
      prompt
    );
    
    const outline = this.parseJsonResponse(result.content);
    
    return {
      title: outline.title,
      sections: outline.sections.map((s: any) => ({
        heading: s.heading,
        moduleIds: (s.moduleIndexes || []).map((i: number) => modules[i - 1]?.id).filter(Boolean),
        keyPoints: s.keyPoints || [s.description || '待補充內容'],
        estimatedWords: s.estimatedWords || 300
      })),
      totalEstimatedWords: outline.totalEstimatedWords || 1500
    };
  }

  // 生成完整文章
  async generateArticle(options: ArticleGenerationOptions): Promise<GeneratedArticle> {
    const {
      sessionId,
      moduleIds,
      articleType,
      style = 'mbpack',
      customTitle,
      customInstructions,
      generateBilingual = false
    } = options;
    
    // 獲取模組
    const modules = await prisma.researchModule.findMany({
      where: { id: { in: moduleIds } },
      include: {
        sources: {
          include: { source: true }
        }
      }
    });
    
    if (modules.length === 0) {
      throw new Error('No modules found');
    }
    
    // 獲取主題
    const session = await prisma.researchSession.findUnique({
      where: { id: sessionId }
    });
    const topic = session?.topic || customTitle || modules[0].title_zh;
    
    // 獲取模板和風格
    const template = ARTICLE_TEMPLATES[articleType] || ARTICLE_TEMPLATES.trend;
    const writingStyle = style === 'dawnbags' ? DAWNBAGS_STYLE : MBPACK_STYLE;
    template.style = writingStyle;
    
    // 生成中文文章
    const zhPrompt = buildWritingPrompt(
      template,
      topic,
      modules.map(m => ({
        title: m.title_zh,
        conclusion: m.conclusion_zh,
        insight: m.insight_zh || ''
      })),
      customInstructions
    );
    
    const zhResult = await aiOrchestrator.execute(
      'WRITING_ASSISTANCE',
      this.getSystemPrompt(),
      zhPrompt,
      { preferQuality: true, temperature: 0.6 }
    );
    
    const content_zh = zhResult.content;
    
    // 提取標題和摘要
    const title_zh = customTitle || this.extractTitle(content_zh);
    const excerpt_zh = this.generateExcerpt(content_zh);
    
    // 收集標籤
    const tags = this.collectTags(modules);
    
    // 計算字數
    const wordCount = this.countWords(content_zh);
    
    // 生成標題建議
    const suggestedTitles = await this.suggestTitles(sessionId, moduleIds, style);
    
    const article: GeneratedArticle = {
      title_zh,
      content_zh,
      excerpt_zh,
      metaDescription_zh: excerpt_zh, // Use excerpt as meta description
      tags,
      wordCount,
      moduleIds,
      suggestedTitles
    };
    
    // 生成英文版（如果需要）
    if (generateBilingual) {
      const enResult = await this.generateEnglishVersion(content_zh, title_zh, modules);
      article.title_en = enResult.title;
      article.content_en = enResult.content;
      article.excerpt_en = enResult.excerpt;
    }
    
    return article;
  }

  // 生成英文版本
  private async generateEnglishVersion(
    content_zh: string,
    title_zh: string,
    modules: any[]
  ): Promise<{ title: string; content: string; excerpt: string }> {
    const prompt = `請將以下繁體中文文章翻譯成專業的英文版本。

原文標題: ${title_zh}

原文內容:
${content_zh}

翻譯要求:
1. 保持專業的包裝產業語調
2. 適當調整句式以符合英文閱讀習慣
3. 專業術語使用正確的英文對應詞
4. 保持原文的結構和格式

請直接輸出翻譯後的 Markdown 格式文章，開頭為翻譯後的標題（# 標題）。`;

    const result = await aiOrchestrator.execute(
      'TRANSLATION',
      'You are a professional translator specializing in B2B packaging industry content.',
      prompt,
      { temperature: 0.3 }
    );
    
    const content = result.content;
    const title = this.extractTitle(content);
    const excerpt = this.generateExcerpt(content);
    
    return { title, content, excerpt };
  }

  // 儲存草稿到資料庫
  async saveDraft(
    sessionId: string,
    article: GeneratedArticle,
    status: 'DRAFT' | 'REVIEW' | 'APPROVED' = 'DRAFT'
  ): Promise<string> {
    const draft = await prisma.articleDraft.create({
      data: {
        sessionId,
        title_zh: article.title_zh,
        title_en: article.title_en,
        content_zh: article.content_zh,
        content_en: article.content_en,
        excerpt_zh: article.excerpt_zh,
        excerpt_en: article.excerpt_en,
        metaDescription_zh: article.metaDescription_zh,
        metaDescription_en: article.metaDescription_en,
        status,
        wordCount: article.wordCount
      }
    });
    
    // 建立模組使用記錄
    for (const moduleId of article.moduleIds) {
      await prisma.articleModuleUsage.create({
        data: {
          articleId: draft.id,
          moduleId,
          usageType: 'source'
        }
      });
      
      // 更新模組使用計數
      await prisma.researchModule.update({
        where: { id: moduleId },
        data: { usageCount: { increment: 1 } }
      });
    }
    
    return draft.id;
  }

  // 發布到 Blog
  async publishToBlog(
    draftId: string,
    options: {
      slug?: string;
      coverImage?: string;
      categoryId?: string;
      publishNow?: boolean;
    } = {}
  ): Promise<string> {
    const draft = await prisma.articleDraft.findUnique({
      where: { id: draftId }
    });
    
    if (!draft) {
      throw new Error('Draft not found');
    }
    
    // 生成 slug 和 ID
    const slug = options.slug || this.generateSlug(draft.title_zh);
    const id = `post_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // 建立 Blog 文章（符合 BlogPost schema）
    const post = await prisma.blogPost.create({
      data: {
        id,
        slug,
        title: draft.title_zh,
        title_zh: draft.title_zh,
        title_en: draft.title_en,
        content: draft.content_zh,
        content_zh: draft.content_zh,
        content_en: draft.content_en,
        excerpt: draft.excerpt_zh,
        excerpt_zh: draft.excerpt_zh,
        excerpt_en: draft.excerpt_en,
        coverImage: options.coverImage,
        isPublished: options.publishNow ?? false,
        publishedAt: options.publishNow ? new Date() : null,
        seoTitle_zh: draft.title_zh,
        seoTitle_en: draft.title_en,
        seoDesc_zh: draft.metaDescription_zh || draft.excerpt_zh,
        seoDesc_en: draft.metaDescription_en || draft.excerpt_en,
        updatedAt: new Date()
      }
    });
    
    // 更新草稿狀態
    await prisma.articleDraft.update({
      where: { id: draftId },
      data: { 
        status: 'PUBLISHED'
      }
    });
    
    return post.id;
  }

  // 輔助函數
  private getSystemPrompt(): string {
    return `你是一位專業的包裝產業內容作家，專精於 B2B 包裝、提袋設計、材料創新等主題。

寫作特點:
- 專業但不失親和力
- 重視數據和事實支撐
- 避免過度行銷語言
- 提供可操作的建議
- 使用繁體中文（台灣用語）`;
  }

  private parseJsonResponse(content: string): any {
    let jsonContent = content.trim();
    
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

  private extractTitle(content: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^#\s+(.+)/);
      if (match) return match[1];
    }
    return '未命名文章';
  }

  private generateExcerpt(content: string, maxLength: number = 200): string {
    // 移除標題和 Markdown 格式
    const text = content
      .replace(/^#.+$/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
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
    const chineseChars = content.match(/[\u4e00-\u9fff]/g) || [];
    const englishWords = content.match(/[a-zA-Z]+/g) || [];
    return chineseChars.length + englishWords.length;
  }

  private generateSlug(title: string): string {
    const date = new Date().toISOString().slice(0, 10);
    const slug = title
      .toLowerCase()
      .replace(/[\u4e00-\u9fff]+/g, '') // 移除中文
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    
    return `${date}-${slug || 'article'}`;
  }
}

export const articleGenerator = new ArticleGenerator();
