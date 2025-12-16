'use client';

// app/admin/research/[sessionId]/drafts/new/page.tsx
// 建立新文章草稿

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface ResearchModule {
  id: string;
  title_zh: string;
  moduleType: string;
  humanApproved: boolean;
}

export default function NewDraftPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [modules, setModules] = useState<ResearchModule[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [tone, setTone] = useState<'professional' | 'casual' | 'academic'>('professional');
  const [targetLength, setTargetLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [audience, setAudience] = useState('B2B 包裝產業從業人員');

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/research/modules?sessionId=${sessionId}&approved=true`);
      const data = await res.json();
      setModules(data.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const createDraft = async () => {
    if (selectedModules.length === 0) return;

    setCreating(true);
    try {
      const res = await fetch('/api/admin/research/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          moduleIds: selectedModules,
          tone,
          targetLength,
          primaryAudience: audience,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/research/${sessionId}/drafts/${data.draft.id}`);
      }
    } catch (error) {
      console.error('Error creating draft:', error);
    } finally {
      setCreating(false);
    }
  };

  const moduleTypeLabels: Record<string, string> = {
    TREND: '趨勢',
    MATERIAL: '材料',
    TECHNOLOGY: '技術',
    SUSTAINABILITY: '永續',
    DESIGN: '設計',
    MARKET: '市場',
    INSIGHT: '洞察',
    CASE_STUDY: '案例',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/research/${sessionId}`}
          className="rounded-lg p-2 hover:bg-zinc-100"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">建立文章草稿</h1>
          <p className="text-zinc-500">選擇研究模組並設定寫作風格</p>
        </div>
      </div>

      {/* Module Selection */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-zinc-900">選擇研究模組</h2>

        {modules.length === 0 ? (
          <p className="text-sm text-zinc-500">尚無核准的研究模組</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className={`rounded-lg border p-3 text-left transition-colors ${
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
                <div className="mt-1 font-medium">{module.title_zh}</div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 text-sm text-zinc-500">
          已選擇 {selectedModules.length} 個模組
        </div>
      </div>

      {/* Writing Style */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-zinc-900">寫作風格設定</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">語調</label>
            <div className="flex gap-2">
              {[
                { value: 'professional', label: '專業' },
                { value: 'casual', label: '輕鬆' },
                { value: 'academic', label: '學術' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTone(option.value as typeof tone)}
                  className={`rounded-lg px-4 py-2 text-sm ${
                    tone === option.value
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">文章長度</label>
            <div className="flex gap-2">
              {[
                { value: 'short', label: '短 (~800字)' },
                { value: 'medium', label: '中 (~1500字)' },
                { value: 'long', label: '長 (~2500字)' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTargetLength(option.value as typeof targetLength)}
                  className={`rounded-lg px-4 py-2 text-sm ${
                    targetLength === option.value
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">目標讀者</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link
          href={`/admin/research/${sessionId}`}
          className="rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
        >
          取消
        </Link>
        <button
          onClick={createDraft}
          disabled={creating || selectedModules.length === 0}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {creating ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
          ) : (
            <DocumentTextIcon className="h-4 w-4" />
          )}
          建立草稿
        </button>
      </div>
    </div>
  );
}
