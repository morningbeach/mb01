'use client';

// app/admin/research/studio/[sessionId]/prompts/page.tsx
// 深度研究提示選擇頁面

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  LightBulbIcon,
  SparklesIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

interface ResearchPrompt {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: string[];
  searchKeywords: string[];
  analysisPoints: string[];
  writingGuidelines: string[];
  expertLevel: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

const categoryIcons: Record<string, string> = {
  trend: '📈',
  material: '🧪',
  design: '🎨',
  sustainability: '🌱',
  technology: '⚙️',
  market: '📊',
  custom: '✏️'
};

const expertLevelLabels: Record<string, { label: string; color: string }> = {
  basic: { label: '入門', color: 'bg-green-100 text-green-800' },
  intermediate: { label: '進階', color: 'bg-yellow-100 text-yellow-800' },
  expert: { label: '專家', color: 'bg-purple-100 text-purple-800' }
};

export default function PromptsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [prompts, setPrompts] = useState<ResearchPrompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrompt, setSelectedPrompt] = useState<ResearchPrompt | null>(null);
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [applying, setApplying] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetchSession();
    fetchPrompts();
  }, [sessionId]);

  useEffect(() => {
    fetchPrompts();
  }, [selectedCategory]);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/admin/research/v2/sessions/${sessionId}`);
      const data = await res.json();
      setSession(data.session);
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const fetchPrompts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (session?.topic) {
        params.set('topic', session.topic);
        params.set('focusAreas', session.focusAreas?.join(',') || '');
      }

      const res = await fetch(`/api/admin/research/v2/prompts?${params}`);
      const data = await res.json();
      
      setPrompts(data.prompts || []);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setCustomQuestions([...customQuestions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const applyPrompt = async () => {
    setApplying(true);
    try {
      // 更新 session 的提示設定
      await fetch(`/api/admin/research/v2/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researchPromptId: selectedPrompt?.id || null,
          customQuestions: [
            ...(selectedPrompt?.questions || []),
            ...customQuestions
          ]
        })
      });

      router.push(`/admin/research/studio/${sessionId}`);
    } catch (error) {
      console.error('Error applying prompt:', error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href={`/admin/research/studio/${sessionId}`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            返回研究
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">深度研究提示</h1>
          <p className="mt-1 text-sm text-zinc-500">
            選擇或自訂研究提示模板，引導更深入的研究方向
          </p>
        </div>

        <button
          onClick={applyPrompt}
          disabled={applying || (!selectedPrompt && customQuestions.length === 0)}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {applying ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <SparklesIcon className="h-5 w-5" />
          )}
          套用提示
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Category & Prompts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-sm transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <span>{categoryIcons[cat.id] || '📋'}</span>
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>

          {/* Prompts List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => setSelectedPrompt(prompt)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    selectedPrompt?.id === prompt.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{categoryIcons[prompt.category] || '📋'}</span>
                      <div>
                        <h3 className="font-semibold text-zinc-900">{prompt.name}</h3>
                        <p className="text-sm text-zinc-500">{prompt.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        expertLevelLabels[prompt.expertLevel]?.color || 'bg-gray-100'
                      }`}>
                        {expertLevelLabels[prompt.expertLevel]?.label || prompt.expertLevel}
                      </span>
                      {selectedPrompt?.id === prompt.id && (
                        <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>

                  {/* Preview Questions */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {prompt.questions.slice(0, 3).map((q, i) => (
                      <span key={i} className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                        {q.length > 40 ? q.slice(0, 40) + '...' : q}
                      </span>
                    ))}
                    {prompt.questions.length > 3 && (
                      <span className="text-xs text-zinc-400">+{prompt.questions.length - 3} 更多</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Selected Prompt Detail & Custom Questions */}
        <div className="space-y-4">
          {/* Selected Prompt Detail */}
          {selectedPrompt && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <h3 className="mb-3 font-semibold text-zinc-900 flex items-center gap-2">
                <LightBulbIcon className="h-5 w-5 text-yellow-500" />
                研究問題
              </h3>
              <ul className="space-y-2">
                {selectedPrompt.questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                    <QuestionMarkCircleIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {q}
                  </li>
                ))}
              </ul>

              <h3 className="mt-4 mb-2 font-semibold text-zinc-900 flex items-center gap-2">
                <AcademicCapIcon className="h-5 w-5 text-purple-500" />
                分析要點
              </h3>
              <ul className="space-y-1">
                {selectedPrompt.analysisPoints.map((p, i) => (
                  <li key={i} className="text-sm text-zinc-600">• {p}</li>
                ))}
              </ul>

              <div className="mt-4 pt-4 border-t border-zinc-100">
                <div className="text-xs text-zinc-500 mb-2">搜尋關鍵字：</div>
                <div className="flex flex-wrap gap-1">
                  {selectedPrompt.searchKeywords.slice(0, 6).map((kw, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Custom Questions */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="mb-3 font-semibold text-zinc-900">自訂研究問題</h3>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                placeholder="輸入自訂問題..."
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              />
              <button
                onClick={addQuestion}
                disabled={!newQuestion.trim()}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                添加
              </button>
            </div>

            {customQuestions.length > 0 && (
              <ul className="space-y-2">
                {customQuestions.map((q, i) => (
                  <li key={i} className="flex items-start justify-between gap-2 text-sm text-zinc-700 bg-zinc-50 rounded-lg p-2">
                    <span>{q}</span>
                    <button
                      onClick={() => removeQuestion(i)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      移除
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {customQuestions.length === 0 && !selectedPrompt && (
              <p className="text-sm text-zinc-500">
                選擇一個提示模板或添加自訂問題以開始深度研究
              </p>
            )}
          </div>

          {/* Summary */}
          {(selectedPrompt || customQuestions.length > 0) && (
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 p-4">
              <h3 className="font-semibold text-zinc-900 mb-2">研究設定摘要</h3>
              <div className="text-sm space-y-1">
                {selectedPrompt && (
                  <div className="text-zinc-600">
                    📋 模板：<span className="font-medium">{selectedPrompt.name}</span>
                  </div>
                )}
                <div className="text-zinc-600">
                  ❓ 問題數：{(selectedPrompt?.questions.length || 0) + customQuestions.length}
                </div>
                {selectedPrompt && (
                  <div className="text-zinc-600">
                    🔍 關鍵字：{selectedPrompt.searchKeywords.length} 個
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
