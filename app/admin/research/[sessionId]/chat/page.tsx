'use client';

// app/admin/research/[sessionId]/chat/page.tsx
// AI 對話研究介面

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  CheckIcon,
  TrashIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  isDraft: boolean;
  createdAt: string;
  modelUsed?: string;
}

interface Conversation {
  id: string;
  topic: string;
  messages: Message[];
  session: {
    id: string;
    status: string;
    focusAreas: string[];
  };
}

interface ResearchModule {
  id: string;
  title_zh: string;
  moduleType: string;
  humanApproved: boolean;
}

export default function ResearchChatPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [modules, setModules] = useState<ResearchModule[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/research/modules?sessionId=${sessionId}&approved=true`);
      const data = await res.json();
      setModules(data.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  }, [sessionId]);

  const fetchConversation = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/admin/research/chat/${convId}`);
      const data = await res.json();
      setConversation(data.conversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchModules();
      setLoading(false);
    };
    init();
  }, [fetchModules]);

  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
    }
  }, [conversationId, fetchConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/research/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          conversationId,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (data.conversationId) {
        setConversationId(data.conversationId);
        await fetchConversation(data.conversationId);
      }

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const analyzeModules = async (type: 'compare' | 'synthesize' | 'expand' | 'critique') => {
    if (selectedModules.length === 0 || !conversationId) return;

    setAnalyzing(true);
    try {
      await fetch(`/api/admin/research/chat/${conversationId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleIds: selectedModules,
          analysisType: type,
        }),
      });

      await fetchConversation(conversationId);
    } catch (error) {
      console.error('Error analyzing modules:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const suggestAngles = async () => {
    if (selectedModules.length === 0 || !conversationId) return;

    setAnalyzing(true);
    try {
      await fetch(`/api/admin/research/chat/${conversationId}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleIds: selectedModules,
        }),
      });

      await fetchConversation(conversationId);
    } catch (error) {
      console.error('Error suggesting angles:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const confirmDraft = async (messageId: string) => {
    try {
      await fetch(`/api/admin/research/chat/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          messageId,
        }),
      });

      if (conversationId) {
        await fetchConversation(conversationId);
      }
    } catch (error) {
      console.error('Error confirming draft:', error);
    }
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const moduleTypeLabels: Record<string, string> = {
    TREND: '趨勢',
    MATERIAL: '材料',
    TECHNOLOGY: '技術',
    SUSTAINABILITY: '永續',
    DESIGN: '設計',
    MARKET: '市場',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar - Modules */}
      <div className="w-72 flex-shrink-0 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900">研究模組</h2>
          <Link
            href={`/admin/research/${sessionId}`}
            className="rounded p-1 hover:bg-zinc-100"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </div>

        {modules.length === 0 ? (
          <p className="text-sm text-zinc-500">尚無核准的模組</p>
        ) : (
          <div className="space-y-2">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className={`w-full rounded-lg border p-2 text-left text-sm transition-colors ${
                  selectedModules.includes(module.id)
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${
                      selectedModules.includes(module.id)
                        ? 'bg-white/20'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {moduleTypeLabels[module.moduleType] || module.moduleType}
                  </span>
                </div>
                <div className="mt-1 truncate">{module.title_zh}</div>
              </button>
            ))}
          </div>
        )}

        {/* Analysis Actions */}
        {selectedModules.length > 0 && conversationId && (
          <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4">
            <div className="text-xs font-medium text-zinc-500">
              已選 {selectedModules.length} 個模組
            </div>
            <button
              onClick={() => analyzeModules('synthesize')}
              disabled={analyzing}
              className="w-full rounded-lg bg-purple-100 px-3 py-2 text-sm text-purple-700 hover:bg-purple-200 disabled:opacity-50"
            >
              綜合分析
            </button>
            <button
              onClick={() => analyzeModules('compare')}
              disabled={analyzing}
              className="w-full rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-700 hover:bg-blue-200 disabled:opacity-50"
            >
              比較分析
            </button>
            <button
              onClick={suggestAngles}
              disabled={analyzing}
              className="w-full rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700 hover:bg-green-200 disabled:opacity-50"
            >
              <LightBulbIcon className="mr-1 inline-block h-4 w-4" />
              建議文章角度
            </button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col rounded-xl border border-zinc-200 bg-white">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {!conversationId ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <SparklesIcon className="h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-zinc-500">開始與 AI 研究助手對話</p>
              <p className="text-sm text-zinc-400">
                選取左側模組進行分析，或直接輸入問題
              </p>
            </div>
          ) : conversation?.messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-zinc-500">
              開始對話...
            </div>
          ) : (
            <div className="space-y-4">
              {conversation?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      msg.role === 'USER'
                        ? 'bg-zinc-900 text-white'
                        : 'border border-zinc-200 bg-zinc-50'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                    {msg.role === 'ASSISTANT' && msg.isDraft && (
                      <div className="mt-2 flex items-center gap-2 border-t border-zinc-200 pt-2">
                        <span className="text-xs text-orange-600">草稿</span>
                        <button
                          onClick={() => confirmDraft(msg.id)}
                          className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 hover:bg-green-200"
                        >
                          <CheckIcon className="mr-1 inline-block h-3 w-3" />
                          確認
                        </button>
                        <button className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 hover:bg-red-200">
                          <TrashIcon className="mr-1 inline-block h-3 w-3" />
                          刪除
                        </button>
                      </div>
                    )}
                    {msg.modelUsed && (
                      <div className="mt-1 text-right text-xs text-zinc-400">
                        {msg.modelUsed}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-zinc-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="輸入研究問題或指令..."
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-900 focus:outline-none"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !message.trim()}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {sending ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
