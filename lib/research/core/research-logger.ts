// lib/research/core/research-logger.ts
// 研究操作流程日誌服務

import { prisma } from '@/lib/prisma';

export type LogAction = 
  | 'session_create'      // 創建研究任務
  | 'search_start'        // 開始搜尋
  | 'search_complete'     // 搜尋完成
  | 'scrape_start'        // 開始抓取
  | 'scrape_complete'     // 抓取完成
  | 'scrape_error'        // 抓取失敗
  | 'analyze_start'       // 開始分析
  | 'analyze_complete'    // 分析完成
  | 'module_generate'     // 生成模組
  | 'module_approve'      // 核准模組
  | 'module_reject'       // 拒絕模組
  | 'article_start'       // 開始寫文章
  | 'article_complete'    // 文章完成
  | 'article_edit'        // 編輯文章
  | 'source_add'          // 新增來源
  | 'source_exclude'      // 排除來源
  | 'source_restore'      // 恢復來源
  | 'chat_start'          // 開始對話
  | 'chat_message'        // 對話訊息
  | 'citation_calculate'  // 計算引用分數
  | 'export'              // 匯出
  | 'error';              // 錯誤

export type LogStatus = 'pending' | 'running' | 'success' | 'error';

interface LogOptions {
  sessionId: string;
  action: LogAction;
  status?: LogStatus;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  sourceId?: string;
  moduleId?: string;
  articleId?: string;
  tokensUsed?: number;
  apiCalls?: number;
}

interface LogEntry {
  id: string;
  startedAt: Date;
}

class ResearchLogger {
  private activeOperations: Map<string, LogEntry> = new Map();

  // 開始一個操作
  async start(options: LogOptions): Promise<string> {
    const log = await prisma.researchLog.create({
      data: {
        sessionId: options.sessionId,
        action: options.action,
        status: 'running',
        input: options.input || {},
        startedAt: new Date(),
        sourceId: options.sourceId,
        moduleId: options.moduleId,
        articleId: options.articleId,
      }
    });

    this.activeOperations.set(log.id, {
      id: log.id,
      startedAt: new Date()
    });

    return log.id;
  }

  // 完成一個操作
  async complete(logId: string, options?: {
    output?: Record<string, any>;
    tokensUsed?: number;
    apiCalls?: number;
  }): Promise<void> {
    const entry = this.activeOperations.get(logId);
    const completedAt = new Date();
    const durationMs = entry 
      ? completedAt.getTime() - entry.startedAt.getTime()
      : undefined;

    await prisma.researchLog.update({
      where: { id: logId },
      data: {
        status: 'success',
        output: options?.output || {},
        completedAt,
        durationMs,
        tokensUsed: options?.tokensUsed,
        apiCalls: options?.apiCalls,
      }
    });

    this.activeOperations.delete(logId);
  }

  // 記錄錯誤
  async error(logId: string, error: string | Error): Promise<void> {
    const entry = this.activeOperations.get(logId);
    const completedAt = new Date();
    const durationMs = entry 
      ? completedAt.getTime() - entry.startedAt.getTime()
      : undefined;

    const errorMessage = error instanceof Error ? error.message : error;

    await prisma.researchLog.update({
      where: { id: logId },
      data: {
        status: 'error',
        error: errorMessage,
        completedAt,
        durationMs,
      }
    });

    this.activeOperations.delete(logId);
  }

  // 快速記錄（不需要追蹤時間的簡單操作）
  async log(options: LogOptions): Promise<string> {
    const log = await prisma.researchLog.create({
      data: {
        sessionId: options.sessionId,
        action: options.action,
        status: options.status || 'success',
        input: options.input || {},
        output: options.output || {},
        error: options.error,
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 0,
        sourceId: options.sourceId,
        moduleId: options.moduleId,
        articleId: options.articleId,
        tokensUsed: options.tokensUsed,
        apiCalls: options.apiCalls,
      }
    });

    return log.id;
  }

  // 獲取 session 的所有日誌
  async getSessionLogs(sessionId: string, options?: {
    action?: LogAction;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const logs = await prisma.researchLog.findMany({
      where: {
        sessionId,
        ...(options?.action && { action: options.action })
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 100,
      skip: options?.offset || 0,
    });

    return logs;
  }

  // 獲取操作統計
  async getSessionStats(sessionId: string): Promise<{
    totalOperations: number;
    successCount: number;
    errorCount: number;
    totalDurationMs: number;
    totalTokensUsed: number;
    totalApiCalls: number;
    byAction: Record<string, { count: number; avgDurationMs: number }>;
  }> {
    const logs = await prisma.researchLog.findMany({
      where: { sessionId }
    });

    const stats = {
      totalOperations: logs.length,
      successCount: logs.filter((l: any) => l.status === 'success').length,
      errorCount: logs.filter((l: any) => l.status === 'error').length,
      totalDurationMs: logs.reduce((sum: number, l: any) => sum + (l.durationMs || 0), 0),
      totalTokensUsed: logs.reduce((sum: number, l: any) => sum + (l.tokensUsed || 0), 0),
      totalApiCalls: logs.reduce((sum: number, l: any) => sum + (l.apiCalls || 0), 0),
      byAction: {} as Record<string, { count: number; avgDurationMs: number }>
    };

    // 按操作類型分組統計
    const actionGroups = new Map<string, { count: number; totalMs: number }>();
    for (const log of logs) {
      const existing = actionGroups.get(log.action) || { count: 0, totalMs: 0 };
      actionGroups.set(log.action, {
        count: existing.count + 1,
        totalMs: existing.totalMs + (log.durationMs || 0)
      });
    }

    for (const [action, data] of actionGroups) {
      stats.byAction[action] = {
        count: data.count,
        avgDurationMs: Math.round(data.totalMs / data.count)
      };
    }

    return stats;
  }
}

// 單例
export const researchLogger = new ResearchLogger();

// 操作標籤（用於 UI 顯示）
export const actionLabels: Record<LogAction, { label: string; icon: string; color: string }> = {
  session_create: { label: '創建研究', icon: '📋', color: 'bg-blue-100 text-blue-800' },
  search_start: { label: '開始搜尋', icon: '🔍', color: 'bg-yellow-100 text-yellow-800' },
  search_complete: { label: '搜尋完成', icon: '✅', color: 'bg-green-100 text-green-800' },
  scrape_start: { label: '開始抓取', icon: '🌐', color: 'bg-yellow-100 text-yellow-800' },
  scrape_complete: { label: '抓取完成', icon: '✅', color: 'bg-green-100 text-green-800' },
  scrape_error: { label: '抓取失敗', icon: '❌', color: 'bg-red-100 text-red-800' },
  analyze_start: { label: '開始分析', icon: '🔬', color: 'bg-purple-100 text-purple-800' },
  analyze_complete: { label: '分析完成', icon: '✅', color: 'bg-green-100 text-green-800' },
  module_generate: { label: '生成模組', icon: '📦', color: 'bg-indigo-100 text-indigo-800' },
  module_approve: { label: '核准模組', icon: '👍', color: 'bg-green-100 text-green-800' },
  module_reject: { label: '拒絕模組', icon: '👎', color: 'bg-red-100 text-red-800' },
  article_start: { label: '開始寫作', icon: '✍️', color: 'bg-orange-100 text-orange-800' },
  article_complete: { label: '文章完成', icon: '📝', color: 'bg-green-100 text-green-800' },
  article_edit: { label: '編輯文章', icon: '✏️', color: 'bg-blue-100 text-blue-800' },
  source_add: { label: '新增來源', icon: '➕', color: 'bg-blue-100 text-blue-800' },
  source_exclude: { label: '排除來源', icon: '🚫', color: 'bg-gray-100 text-gray-800' },
  source_restore: { label: '恢復來源', icon: '♻️', color: 'bg-green-100 text-green-800' },
  chat_start: { label: '開始對話', icon: '💬', color: 'bg-cyan-100 text-cyan-800' },
  chat_message: { label: '對話訊息', icon: '💭', color: 'bg-cyan-100 text-cyan-800' },
  citation_calculate: { label: '計算引用', icon: '📊', color: 'bg-purple-100 text-purple-800' },
  export: { label: '匯出', icon: '📤', color: 'bg-gray-100 text-gray-800' },
  error: { label: '錯誤', icon: '⚠️', color: 'bg-red-100 text-red-800' },
};
