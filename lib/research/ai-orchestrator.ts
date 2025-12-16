// lib/research/ai-orchestrator.ts
// AI 多模型調度系統

import { AITaskType, AIModelSelection } from './types';

// 模型配置
const MODEL_CONFIGS: Record<string, {
  provider: 'openai' | 'anthropic' | 'google';
  modelId: string;
  costPer1kInput: number;
  costPer1kOutput: number;
  qualityScore: number;
  maxTokens: number;
  bestFor: AITaskType[];
}> = {
  'gpt-4o': {
    provider: 'openai',
    modelId: 'gpt-4o',
    costPer1kInput: 0.005,
    costPer1kOutput: 0.015,
    qualityScore: 95,
    maxTokens: 128000,
    bestFor: ['WRITING_ASSISTANCE', 'INSIGHT_EXTRACTION', 'CONVERSATION']
  },
  'gpt-4o-mini': {
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    qualityScore: 85,
    maxTokens: 128000,
    bestFor: ['SOURCE_ANALYSIS', 'SUMMARIZATION', 'TRANSLATION']
  },
  'claude-3-5-sonnet': {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    qualityScore: 95,
    maxTokens: 200000,
    bestFor: ['RESEARCH_COLLECTION', 'MODULE_GENERATION', 'WRITING_ASSISTANCE']
  },
  'claude-3-5-haiku': {
    provider: 'anthropic',
    modelId: 'claude-3-5-haiku-20241022',
    costPer1kInput: 0.0008,
    costPer1kOutput: 0.004,
    qualityScore: 80,
    maxTokens: 200000,
    bestFor: ['SOURCE_ANALYSIS', 'SUMMARIZATION']
  },
  'gemini-2.0-flash': {
    provider: 'google',
    modelId: 'gemini-2.0-flash-exp',
    costPer1kInput: 0.0,  // Free tier
    costPer1kOutput: 0.0,
    qualityScore: 88,
    maxTokens: 1000000,
    bestFor: ['RESEARCH_COLLECTION', 'SUMMARIZATION', 'TRANSLATION']
  },
  'gemini-1.5-pro': {
    provider: 'google',
    modelId: 'gemini-1.5-pro-latest',
    costPer1kInput: 0.00125,
    costPer1kOutput: 0.005,
    qualityScore: 90,
    maxTokens: 2000000,
    bestFor: ['INSIGHT_EXTRACTION', 'MODULE_GENERATION']
  }
};

// 任務優先模型映射（優先使用 OpenAI，因為 Gemini 模型可能有版本問題）
const TASK_MODEL_PRIORITY: Record<AITaskType, string[]> = {
  RESEARCH_COLLECTION: ['gpt-4o-mini', 'gpt-4o', 'gemini-2.0-flash', 'claude-3-5-sonnet'],
  SOURCE_ANALYSIS: ['gpt-4o-mini', 'gemini-2.0-flash', 'claude-3-5-haiku'],
  MODULE_GENERATION: ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet', 'gemini-2.0-flash'],
  INSIGHT_EXTRACTION: ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet'],
  WRITING_ASSISTANCE: ['gpt-4o', 'claude-3-5-sonnet', 'gpt-4o-mini'],
  CONVERSATION: ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet'],
  TRANSLATION: ['gpt-4o-mini', 'gemini-2.0-flash', 'claude-3-5-haiku'],
  SUMMARIZATION: ['gpt-4o-mini', 'gemini-2.0-flash', 'claude-3-5-haiku']
};

export class AIOrchestrator {
  private apiKeys: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };

  constructor() {
    this.apiKeys = {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GEMINI_API_KEY
    };
  }

  // 根據任務選擇最佳模型
  selectModel(taskType: AITaskType, preferQuality: boolean = false): AIModelSelection | null {
    const priorityList = TASK_MODEL_PRIORITY[taskType];
    
    for (const modelKey of priorityList) {
      const config = MODEL_CONFIGS[modelKey];
      if (!config) continue;
      
      // 檢查 API Key 是否可用
      if (!this.apiKeys[config.provider]) continue;
      
      // 如果偏好品質，選擇品質分數 >= 90 的模型
      if (preferQuality && config.qualityScore < 90) continue;
      
      return {
        provider: config.provider,
        modelId: config.modelId,
        taskType
      };
    }
    
    return null;
  }

  // 執行 AI 調用
  async execute(
    taskType: AITaskType,
    systemPrompt: string,
    userPrompt: string,
    options?: {
      preferQuality?: boolean;
      temperature?: number;
      maxTokens?: number;
      forceModel?: string;
    }
  ): Promise<{ content: string; model: string; usage: { input: number; output: number } }> {
    
    let modelConfig: typeof MODEL_CONFIGS[string] | undefined;
    
    if (options?.forceModel && MODEL_CONFIGS[options.forceModel]) {
      modelConfig = MODEL_CONFIGS[options.forceModel];
    } else {
      const selection = this.selectModel(taskType, options?.preferQuality);
      if (!selection) {
        throw new Error(`No available model for task: ${taskType}`);
      }
      modelConfig = Object.values(MODEL_CONFIGS).find(
        c => c.provider === selection.provider && c.modelId === selection.modelId
      );
    }

    if (!modelConfig) {
      throw new Error('Model configuration not found');
    }

    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 4096;

    switch (modelConfig.provider) {
      case 'openai':
        return this.callOpenAI(modelConfig.modelId, systemPrompt, userPrompt, temperature, maxTokens);
      case 'anthropic':
        return this.callAnthropic(modelConfig.modelId, systemPrompt, userPrompt, temperature, maxTokens);
      case 'google':
        return this.callGemini(modelConfig.modelId, systemPrompt, userPrompt, temperature, maxTokens);
      default:
        throw new Error(`Unknown provider: ${modelConfig.provider}`);
    }
  }

  private async callOpenAI(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
    maxTokens: number
  ) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKeys.openai}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model,
      usage: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0
      }
    };
  }

  private async callAnthropic(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
    maxTokens: number
  ) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKeys.anthropic!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      model,
      usage: {
        input: data.usage?.input_tokens || 0,
        output: data.usage?.output_tokens || 0
      }
    };
  }

  private async callGemini(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
    maxTokens: number
  ) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(this.apiKeys.google!);
    
    const geminiModel = genAI.getGenerativeModel({ 
      model,
      systemInstruction: systemPrompt
    });

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    });

    const response = result.response;
    return {
      content: response.text(),
      model,
      usage: {
        input: response.usageMetadata?.promptTokenCount || 0,
        output: response.usageMetadata?.candidatesTokenCount || 0
      }
    };
  }

  // 獲取可用模型列表
  getAvailableModels(): string[] {
    return Object.entries(MODEL_CONFIGS)
      .filter(([_, config]) => this.apiKeys[config.provider])
      .map(([key]) => key);
  }

  // 估算成本
  estimateCost(modelKey: string, inputTokens: number, outputTokens: number): number {
    const config = MODEL_CONFIGS[modelKey];
    if (!config) return 0;
    
    return (inputTokens / 1000) * config.costPer1kInput + 
           (outputTokens / 1000) * config.costPer1kOutput;
  }
}

export const aiOrchestrator = new AIOrchestrator();
