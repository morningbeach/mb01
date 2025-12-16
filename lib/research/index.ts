// lib/research/index.ts
// Research System 統一導出 - V2 重構版

// 類型定義
export * from './types';

// AI 編排器
export { aiOrchestrator } from './ai-orchestrator';

// 新架構 - 引擎層
export * from './engines';

// 新架構 - 核心服務層
export * from './core';

// 新架構 - 寫作層
export * from './writing';

// 舊版相容 (deprecated)
export { ResearchEngine, researchEngine } from './research-engine';
export { WritingAssistant, writingAssistant } from './writing-assistant';
export { ConversationAssistant, conversationAssistant } from './conversation-assistant';
export * from './prompts';
