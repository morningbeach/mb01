// lib/research/conversation-assistant.ts
// AI 對話研究視窗

import { prisma } from '@/lib/prisma';
import { aiOrchestrator } from './ai-orchestrator';
import { buildConversationSystemPrompt } from './prompts';

export class ConversationAssistant {
  
  // 開始新對話
  async startConversation(sessionId: string, topic?: string): Promise<string> {
    const conversation = await prisma.researchConversation.create({
      data: {
        sessionId,
        topic
      }
    });

    return conversation.id;
  }

  // 發送訊息並獲取回應
  async chat(
    conversationId: string,
    userMessage: string,
    options?: {
      forceModel?: string;
    }
  ): Promise<{ content: string; messageId: string; isDraft: boolean }> {
    // 獲取對話和相關研究模組
    const conversation = await prisma.researchConversation.findUnique({
      where: { id: conversationId },
      include: {
        session: {
          include: {
            modules: {
              where: { humanApproved: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20 // 只取最近 20 條訊息作為上下文
        }
      }
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // 儲存用戶訊息
    await prisma.researchMessage.create({
      data: {
        conversationId,
        role: 'USER',
        content: userMessage
      }
    });

    // 建立系統提示（包含研究模組上下文）
    const systemPrompt = buildConversationSystemPrompt(
      conversation.session.modules.map(m => ({
        id: m.id,
        title_zh: m.title_zh,
        conclusion_zh: m.conclusion_zh,
        moduleType: m.moduleType
      }))
    );

    // 建立對話歷史
    const messages = conversation.messages.map(m => ({
      role: m.role.toLowerCase() as 'user' | 'assistant',
      content: m.content
    }));

    // 完整的用戶提示（包含歷史）
    const fullPrompt = messages.length > 0
      ? `對話歷史：\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}\n\n用戶最新訊息：${userMessage}`
      : userMessage;

    // 調用 AI
    const result = await aiOrchestrator.execute(
      'CONVERSATION',
      systemPrompt,
      fullPrompt,
      { 
        forceModel: options?.forceModel,
        temperature: 0.7
      }
    );

    // 解析回應中引用的模組 ID
    const referencedModuleIds = this.extractModuleReferences(
      result.content,
      conversation.session.modules.map(m => m.id)
    );

    // 儲存 AI 回應（標記為草稿）
    const aiMessage = await prisma.researchMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: result.content,
        isDraft: true, // 所有 AI 生成的內容都標記為草稿
        referencedModuleIds,
        modelUsed: result.model
      }
    });

    return {
      content: result.content,
      messageId: aiMessage.id,
      isDraft: true
    };
  }

  // 特定研究任務
  async analyzeModules(
    conversationId: string,
    moduleIds: string[],
    analysisType: 'compare' | 'synthesize' | 'expand' | 'critique'
  ): Promise<string> {
    const modules = await prisma.researchModule.findMany({
      where: { id: { in: moduleIds } },
      include: {
        sources: {
          include: { source: true }
        }
      }
    });

    const analysisPrompts: Record<string, string> = {
      compare: `請比較以下研究模組，分析它們的異同點、互補關係和潛在衝突：`,
      synthesize: `請綜合以下研究模組，提煉出一個統一的核心觀點或結論：`,
      expand: `請擴展以下研究模組，探討可能的延伸議題、深入方向和相關聯的領域：`,
      critique: `請批判性地審視以下研究模組，指出可能的局限性、需要進一步驗證的論點和潛在的偏見：`
    };

    const modulesContext = modules.map(m => 
      `[${m.id}] ${m.moduleType}: ${m.title_zh}\n結論: ${m.conclusion_zh}\n來源: ${m.sources.map(s => s.source.title).join(', ')}`
    ).join('\n\n');

    const prompt = `${analysisPrompts[analysisType]}

${modulesContext}

請提供深入的分析。注意：你的分析是建議性質，將供人類研究員參考和決策。`;

    const result = await aiOrchestrator.execute(
      'INSIGHT_EXTRACTION',
      buildConversationSystemPrompt(modules.map(m => ({
        id: m.id,
        title_zh: m.title_zh,
        conclusion_zh: m.conclusion_zh,
        moduleType: m.moduleType
      }))),
      prompt,
      { preferQuality: true }
    );

    // 儲存分析結果
    await prisma.researchMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: result.content,
        isDraft: true,
        referencedModuleIds: moduleIds,
        modelUsed: result.model
      }
    });

    return result.content;
  }

  // 請求文章角度建議
  async suggestArticleAngles(
    conversationId: string,
    moduleIds: string[],
    targetAudience?: string
  ): Promise<{ angle: string; rationale: string; modules: string[] }[]> {
    const modules = await prisma.researchModule.findMany({
      where: { id: { in: moduleIds } }
    });

    const prompt = `基於以下研究模組，請建議 3-5 個可能的文章角度/切入點。

研究模組：
${modules.map(m => `- [${m.moduleType}] ${m.title_zh}`).join('\n')}

${targetAudience ? `目標讀者: ${targetAudience}` : '目標讀者: B2B 包裝產業從業人員'}

請以 JSON 格式輸出：
[
  {
    "angle": "文章角度/標題方向",
    "rationale": "為什麼這個角度有價值（50字以內）",
    "moduleTypes": ["TREND", "MATERIAL"]
  }
]

注意：這些只是建議，最終決策權在人類研究員。`;

    const result = await aiOrchestrator.execute(
      'INSIGHT_EXTRACTION',
      '你是一位包裝產業內容策略顧問。',
      prompt
    );

    try {
      const suggestions = JSON.parse(result.content);
      
      // 儲存建議
      await prisma.researchMessage.create({
        data: {
          conversationId,
          role: 'ASSISTANT',
          content: `文章角度建議：\n${suggestions.map((s: any, i: number) => 
            `${i + 1}. ${s.angle}\n   理由: ${s.rationale}`
          ).join('\n')}`,
          isDraft: true,
          referencedModuleIds: moduleIds
        }
      });

      return suggestions;
    } catch {
      return [];
    }
  }

  // 將草稿內容確認為正式內容
  async confirmDraft(messageId: string): Promise<void> {
    await prisma.researchMessage.update({
      where: { id: messageId },
      data: { isDraft: false }
    });
  }

  // 刪除草稿
  async deleteDraft(messageId: string): Promise<void> {
    const message = await prisma.researchMessage.findUnique({
      where: { id: messageId }
    });

    if (!message || !message.isDraft) {
      throw new Error('Can only delete draft messages');
    }

    await prisma.researchMessage.delete({
      where: { id: messageId }
    });
  }

  // 獲取對話歷史
  async getConversation(conversationId: string) {
    return prisma.researchConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        session: {
          select: {
            id: true,
            status: true,
            focusAreas: true
          }
        }
      }
    });
  }

  // 獲取研究任務的所有對話
  async getSessionConversations(sessionId: string) {
    return prisma.researchConversation.findMany({
      where: { sessionId },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 提取模組引用
  private extractModuleReferences(content: string, moduleIds: string[]): string[] {
    const referenced: string[] = [];
    
    for (const id of moduleIds) {
      if (content.includes(id) || content.includes(`[${id}]`)) {
        referenced.push(id);
      }
    }

    return referenced;
  }
}

export const conversationAssistant = new ConversationAssistant();
