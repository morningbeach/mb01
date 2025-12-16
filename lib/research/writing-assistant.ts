// lib/research/writing-assistant.ts
// 半自動撰文系統

import { prisma } from '@/lib/prisma';
import { aiOrchestrator } from './ai-orchestrator';
import { 
  buildWritingAssistancePrompt,
  RESEARCH_COLLECTION_SYSTEM_PROMPT
} from './prompts';
import { ArticleOutline, WritingStyle, DEFAULT_WRITING_STYLE } from './types';

export class WritingAssistant {
  
  // 生成文章大綱（基於選定的模組）
  async generateOutline(
    moduleIds: string[],
    suggestedTitle?: string
  ): Promise<ArticleOutline> {
    // 獲取選定的模組
    const modules = await prisma.researchModule.findMany({
      where: { id: { in: moduleIds } }
    });

    if (modules.length === 0) {
      throw new Error('No modules selected');
    }

    const modulesContext = modules.map(m => ({
      type: m.moduleType,
      title: m.title_zh,
      conclusion: m.conclusion_zh,
      insight: m.insight_zh || ''
    }));

    const prompt = `基於以下研究模組，請生成一篇文章的大綱。

研究模組：
${modulesContext.map((m, i) => `${i + 1}. [${m.type}] ${m.title}\n   結論: ${m.conclusion}`).join('\n\n')}

${suggestedTitle ? `建議標題方向: ${suggestedTitle}` : ''}

請生成文章大綱，包含：
1. 文章標題（專業、吸引人、不誇張）
2. 3-5 個章節，每個章節包含：
   - 章節標題
   - 使用的模組編號
   - 章節說明（50字以內）
3. 預估字數

請以 JSON 格式輸出：
{
  "title": "文章標題",
  "sections": [
    {
      "heading": "章節標題",
      "moduleIndexes": [1, 2],
      "description": "章節說明"
    }
  ],
  "estimatedWordCount": 1500
}`;

    const result = await aiOrchestrator.execute(
      'WRITING_ASSISTANCE',
      RESEARCH_COLLECTION_SYSTEM_PROMPT,
      prompt
    );

    try {
      const outline = JSON.parse(result.content);
      return {
        title: outline.title,
        sections: outline.sections.map((s: any) => ({
          heading: s.heading,
          moduleIds: s.moduleIndexes.map((i: number) => modules[i - 1]?.id).filter(Boolean),
          description: s.description
        })),
        estimatedWordCount: outline.estimatedWordCount
      };
    } catch {
      throw new Error('Failed to parse outline');
    }
  }

  // 生成文章草稿
  async generateDraft(
    sessionId: string,
    moduleIds: string[],
    outline: ArticleOutline,
    style: WritingStyle = DEFAULT_WRITING_STYLE
  ): Promise<string> {
    // 獲取模組
    const modules = await prisma.researchModule.findMany({
      where: { id: { in: moduleIds } }
    });

    const modulesData = modules.map(m => ({
      title_zh: m.title_zh,
      conclusion_zh: m.conclusion_zh,
      insight_zh: m.insight_zh || ''
    }));

    const outlineData = {
      title: outline.title,
      sections: outline.sections.map(s => ({
        heading: s.heading,
        description: s.description
      }))
    };

    const prompt = buildWritingAssistancePrompt(modulesData, outlineData, style);

    const result = await aiOrchestrator.execute(
      'WRITING_ASSISTANCE',
      RESEARCH_COLLECTION_SYSTEM_PROMPT,
      prompt,
      { preferQuality: true, maxTokens: 8000 }
    );

    // 儲存草稿
    const wordCount = result.content.replace(/[^\u4e00-\u9fa5]/g, '').length + 
                      result.content.split(/\s+/).filter(w => /[a-zA-Z]/.test(w)).length;
    const readingTime = Math.ceil(wordCount / 400); // 假設每分鐘 400 字

    const article = await prisma.articleDraft.create({
      data: {
        sessionId,
        title_zh: outline.title,
        content_zh: result.content,
        wordCount,
        readingTime,
        outline: outline as any,
        status: 'DRAFT'
      }
    });

    // 建立文章與模組的使用關聯
    for (let i = 0; i < moduleIds.length; i++) {
      await prisma.articleModuleUsage.create({
        data: {
          articleId: article.id,
          moduleId: moduleIds[i],
          usageType: 'basis',
          position: i
        }
      });

      // 更新模組使用計數
      await prisma.researchModule.update({
        where: { id: moduleIds[i] },
        data: { usageCount: { increment: 1 } }
      });
    }

    return article.id;
  }

  // 重新生成特定章節
  async regenerateSection(
    articleId: string,
    sectionIndex: number,
    instructions?: string
  ): Promise<string> {
    const article = await prisma.articleDraft.findUnique({
      where: { id: articleId },
      include: {
        moduleUsages: {
          include: { module: true }
        }
      }
    });

    if (!article) {
      throw new Error('Article not found');
    }

    if (!article.outline) {
      throw new Error('Article has no outline');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outline = article.outline as any as ArticleOutline;
    const section = outline.sections?.[sectionIndex];

    if (!section) {
      throw new Error('Section not found');
    }

    // 獲取該章節使用的模組
    const sectionModules = article.moduleUsages
      .filter(u => section.moduleIds.includes(u.moduleId))
      .map(u => u.module);

    const prompt = `請重新撰寫以下章節。

章節標題：${section.heading}
章節說明：${section.description}

相關研究模組：
${sectionModules.map(m => `- ${m.title_zh}: ${m.conclusion_zh}`).join('\n')}

${instructions ? `特別指示：${instructions}` : ''}

請以專業的繁體中文撰寫，保持與產業研究報告一致的風格。
輸出純 Markdown 格式的章節內容（不含章節標題，只有內容）。`;

    const result = await aiOrchestrator.execute(
      'WRITING_ASSISTANCE',
      RESEARCH_COLLECTION_SYSTEM_PROMPT,
      prompt
    );

    return result.content;
  }

  // 人類編輯文章
  async updateDraft(
    articleId: string,
    updates: {
      title_zh?: string;
      content_zh?: string;
    }
  ): Promise<void> {
    const wordCount = updates.content_zh 
      ? updates.content_zh.replace(/[^\u4e00-\u9fa5]/g, '').length + 
        updates.content_zh.split(/\s+/).filter(w => /[a-zA-Z]/.test(w)).length
      : undefined;

    await prisma.articleDraft.update({
      where: { id: articleId },
      data: {
        ...updates,
        ...(wordCount && { wordCount, readingTime: Math.ceil(wordCount / 400) }),
        humanEdited: true,
        version: { increment: 1 }
      }
    });
  }

  // 核准文章
  async approveDraft(articleId: string): Promise<void> {
    await prisma.articleDraft.update({
      where: { id: articleId },
      data: {
        status: 'APPROVED',
        humanApproved: true
      }
    });
  }

  // 獲取文章詳情
  async getDraft(articleId: string) {
    return prisma.articleDraft.findUnique({
      where: { id: articleId },
      include: {
        session: true,
        moduleUsages: {
          include: {
            module: {
              include: {
                sources: {
                  include: { source: true }
                }
              }
            }
          }
        }
      }
    });
  }

  // 獲取文章草稿列表
  async getDrafts(status?: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED') {
    return prisma.articleDraft.findMany({
      where: status ? { status } : undefined,
      include: {
        session: true,
        _count: {
          select: { moduleUsages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  // 發布文章到 BlogPost
  async publishToBlog(articleId: string): Promise<string> {
    const article = await prisma.articleDraft.findUnique({
      where: { id: articleId },
      include: {
        moduleUsages: {
          include: { module: true }
        }
      }
    });

    if (!article) {
      throw new Error('Article not found');
    }

    if (article.status !== 'APPROVED') {
      throw new Error('Article must be approved before publishing');
    }

    // 生成 slug
    const slug = this.generateSlug(article.title_zh);

    // 收集標籤
    const tags = new Set<string>();
    article.moduleUsages.forEach(u => {
      u.module.tags.forEach(t => tags.add(t));
    });

    // 建立 BlogPost
    const blogPost = await prisma.blogPost.create({
      data: {
        id: `blog-${Date.now()}`,
        slug,
        title: article.title_zh,
        title_zh: article.title_zh,
        title_en: article.title_en,
        content: article.content_zh,
        content_zh: article.content_zh,
        content_en: article.content_en,
        excerpt_zh: article.content_zh.slice(0, 200) + '...',
        isPublished: true,
        publishedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // 更新文章狀態
    await prisma.articleDraft.update({
      where: { id: articleId },
      data: { status: 'PUBLISHED' }
    });

    return blogPost.id;
  }

  private generateSlug(title: string): string {
    const pinyin = title
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
    
    const timestamp = Date.now().toString(36);
    return `${pinyin.slice(0, 50)}-${timestamp}`;
  }
}

export const writingAssistant = new WritingAssistant();
