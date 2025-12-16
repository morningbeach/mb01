// lib/research/core/chat-service.ts
// 研究對話服務 - 互動式研究助手

import { prisma } from '@/lib/prisma';
import { aiOrchestrator } from '../ai-orchestrator';
import { researchService } from './research-service';
import { scraperEngine } from '../engines/scraper-engine';
import { analysisEngine } from '../engines/analysis-engine';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    action?: ChatAction;
    moduleIds?: string[];
    urls?: string[];
    suggestions?: string[];
  };
}

export interface ChatAction {
  type: 'add_url' | 'search_more' | 'analyze_module' | 'generate_article' | 'suggest_topics';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
}

export interface ChatContext {
  sessionId: string;
  topic: string;
  modules: {
    id: string;
    title: string;
    type: string;
    conclusion: string;
  }[];
  sources: {
    id: string;
    title: string;
    url: string;
  }[];
  recentMessages: ChatMessage[];
}

export class ChatService {
  
  // 發送訊息並獲取回應
  async chat(
    conversationId: string,
    userMessage: string
  ): Promise<ChatMessage> {
    // 獲取對話上下文
    const context = await this.getContext(conversationId);
    
    // 儲存用戶訊息
    await prisma.researchMessage.create({
      data: {
        conversationId,
        role: 'USER',
        content: userMessage
      }
    });

    // 檢測用戶意圖
    const intent = await this.detectIntent(userMessage, context);
    
    // 執行對應動作
    let actionResult: any = null;
    if (intent.action) {
      actionResult = await this.executeAction(intent.action, context, userMessage);
    }

    // 生成 AI 回應
    const response = await this.generateResponse(
      userMessage,
      context,
      intent,
      actionResult
    );

    // 儲存 AI 回應
    const aiMessage = await prisma.researchMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: response.content,
        isDraft: true,
        referencedModuleIds: response.moduleIds || []
      }
    });

    return {
      id: aiMessage.id,
      role: 'assistant',
      content: response.content,
      timestamp: aiMessage.createdAt,
      metadata: {
        action: intent.action ? {
          type: intent.action,
          status: actionResult ? 'completed' : 'failed',
          result: actionResult
        } : undefined,
        moduleIds: response.moduleIds,
        suggestions: response.suggestions
      }
    };
  }

  // 開始新對話
  async startConversation(sessionId: string, topic?: string): Promise<string> {
    const conversation = await prisma.researchConversation.create({
      data: {
        sessionId,
        topic
      }
    });

    // 生成歡迎訊息
    const context = await this.getContext(conversation.id);
    const welcomeMessage = this.generateWelcomeMessage(context);

    await prisma.researchMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: welcomeMessage
      }
    });

    return conversation.id;
  }

  // 獲取對話上下文
  private async getContext(conversationId: string): Promise<ChatContext> {
    const conversation = await prisma.researchConversation.findUnique({
      where: { id: conversationId },
      include: {
        session: {
          include: {
            modules: {
              where: { isReusable: true },
              orderBy: { createdAt: 'desc' },
              take: 20
            },
            sources: {
              where: { isExcluded: false },
              orderBy: { authorityScore: 'desc' },
              take: 20
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return {
      sessionId: conversation.sessionId,
      topic: conversation.session.topic || '',
      modules: conversation.session.modules.map(m => ({
        id: m.id,
        title: m.title_zh,
        type: m.moduleType,
        conclusion: m.conclusion_zh.substring(0, 200)
      })),
      sources: conversation.session.sources.map(s => ({
        id: s.id,
        title: s.title,
        url: s.url
      })),
      recentMessages: conversation.messages.reverse().map(m => ({
        id: m.id,
        role: m.role.toLowerCase() as 'user' | 'assistant',
        content: m.content,
        timestamp: m.createdAt
      }))
    };
  }

  // 檢測用戶意圖
  private async detectIntent(
    message: string,
    context: ChatContext
  ): Promise<{ action?: ChatAction['type']; params?: any }> {
    const lowerMessage = message.toLowerCase();

    // URL 檢測
    const urlMatch = message.match(/https?:\/\/[^\s]+/g);
    if (urlMatch) {
      return { action: 'add_url', params: { urls: urlMatch } };
    }

    // 關鍵詞檢測
    if (lowerMessage.includes('搜尋') || lowerMessage.includes('查找') || lowerMessage.includes('找找')) {
      return { action: 'search_more' };
    }

    if (lowerMessage.includes('寫文章') || lowerMessage.includes('生成文章') || lowerMessage.includes('撰文')) {
      return { action: 'generate_article' };
    }

    if (lowerMessage.includes('分析') && lowerMessage.includes('模組')) {
      return { action: 'analyze_module' };
    }

    if (lowerMessage.includes('建議') || lowerMessage.includes('方向') || lowerMessage.includes('還可以')) {
      return { action: 'suggest_topics' };
    }

    return {};
  }

  // 執行動作
  private async executeAction(
    action: ChatAction['type'],
    context: ChatContext,
    userMessage: string
  ): Promise<any> {
    switch (action) {
      case 'add_url': {
        const urls = userMessage.match(/https?:\/\/[^\s]+/g) || [];
        if (urls.length === 0) return null;

        try {
          const result = await researchService.addUrls(context.sessionId, urls);
          return result;
        } catch (error) {
          console.error('[ChatService] Add URL error:', error);
          return null;
        }
      }

      case 'search_more': {
        // 從訊息中提取關鍵詞
        const keywords = userMessage
          .replace(/搜尋|查找|找找|更多|關於/g, '')
          .trim();

        if (!keywords) return null;

        try {
          const { searchEngine } = await import('../engines/search-engine');
          const results = await searchEngine.search({
            query: keywords,
            num: 10
          });
          return { query: keywords, results: results.length };
        } catch (error) {
          console.error('[ChatService] Search error:', error);
          return null;
        }
      }

      case 'suggest_topics': {
        return await this.generateTopicSuggestions(context);
      }

      default:
        return null;
    }
  }

  // 生成 AI 回應
  private async generateResponse(
    userMessage: string,
    context: ChatContext,
    intent: { action?: ChatAction['type']; params?: any },
    actionResult: any
  ): Promise<{
    content: string;
    moduleIds?: string[];
    suggestions?: string[];
  }> {
    const systemPrompt = this.buildSystemPrompt(context);
    
    let userPrompt = userMessage;

    // 添加動作結果
    if (actionResult) {
      userPrompt += `\n\n[系統執行結果: ${JSON.stringify(actionResult)}]`;
    }

    // 添加對話歷史
    const historyText = context.recentMessages
      .slice(-6)
      .map(m => `${m.role === 'user' ? '用戶' : 'AI'}: ${m.content}`)
      .join('\n');

    if (historyText) {
      userPrompt = `對話歷史:\n${historyText}\n\n用戶最新訊息: ${userMessage}`;
    }

    const result = await aiOrchestrator.execute(
      'CONVERSATION',
      systemPrompt,
      userPrompt,
      { temperature: 0.7 }
    );

    // 提取引用的模組 ID
    const moduleIds = this.extractModuleReferences(result.content, context.modules);

    return {
      content: result.content,
      moduleIds
    };
  }

  // 建立系統提示詞
  private buildSystemPrompt(context: ChatContext): string {
    const modulesContext = context.modules
      .map(m => `[${m.id.substring(0, 8)}] ${m.type}: ${m.title}`)
      .join('\n');

    return `你是 MB Pack 的研究助理，正在協助用戶進行「${context.topic}」的包裝產業研究。

## 目前的研究模組
${modulesContext || '（尚無模組）'}

## 你的能力
1. 回答關於研究內容的問題
2. 幫助用戶理解和比較不同模組
3. 當用戶提供 URL 時，系統會自動擷取並分析
4. 建議進一步的研究方向
5. 協助規劃文章結構

## 回應原則
- 基於現有模組回答，避免憑空編造
- 引用模組時標註 [模組ID前8位]
- 如需更多資料，建議用戶提供 URL 或搜尋關鍵詞
- 保持專業但友善的語調
- 回應控制在 300 字以內，除非用戶要求詳細說明

## 特殊指令
- 當用戶貼上 URL，系統會自動擷取分析，你只需確認收到
- 當用戶要求「搜尋更多」，提取關鍵詞後系統會執行搜尋
- 當用戶要求寫文章，引導他選擇要使用的模組`;
  }

  // 生成歡迎訊息
  private generateWelcomeMessage(context: ChatContext): string {
    const moduleCount = context.modules.length;
    const sourceCount = context.sources.length;

    if (moduleCount === 0) {
      return `👋 歡迎！我是你的研究助理。

目前「${context.topic || '這個研究任務'}」還沒有研究模組。

你可以：
1. 貼上相關網址讓我分析
2. 告訴我想搜尋的關鍵詞
3. 請我開始自動搜尋相關資料

需要我幫你做什麼？`;
    }

    return `👋 歡迎回來！

「${context.topic}」的研究進度：
- 📦 ${moduleCount} 個研究模組
- 📚 ${sourceCount} 個來源

你可以：
- 問我關於研究內容的問題
- 貼上新的網址深入研究
- 請我生成文章草稿

有什麼我可以幫忙的？`;
  }

  // 生成主題建議
  private async generateTopicSuggestions(context: ChatContext): Promise<string[]> {
    if (context.modules.length === 0) {
      return [];
    }

    const prompt = `基於以下研究模組，建議 3 個可以深入研究的方向：

${context.modules.map(m => `- ${m.title}`).join('\n')}

請以 JSON 陣列格式輸出 3 個建議方向：
["建議1", "建議2", "建議3"]`;

    const result = await aiOrchestrator.execute(
      'INSIGHT_EXTRACTION',
      '你是一位包裝產業研究顧問。',
      prompt,
      { temperature: 0.8 }
    );

    try {
      let content = result.content.trim();
      if (content.startsWith('```')) {
        content = content.replace(/```json?|```/g, '').trim();
      }
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  // 提取模組引用
  private extractModuleReferences(
    content: string,
    modules: { id: string; title: string }[]
  ): string[] {
    const referenced: string[] = [];

    for (const module of modules) {
      const shortId = module.id.substring(0, 8);
      if (content.includes(shortId) || content.includes(module.title)) {
        referenced.push(module.id);
      }
    }

    return referenced;
  }

  // 獲取對話歷史
  async getHistory(conversationId: string): Promise<ChatMessage[]> {
    const messages = await prisma.researchMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });

    return messages.map(m => ({
      id: m.id,
      role: m.role.toLowerCase() as 'user' | 'assistant',
      content: m.content,
      timestamp: m.createdAt
    }));
  }
}

export const chatService = new ChatService();
