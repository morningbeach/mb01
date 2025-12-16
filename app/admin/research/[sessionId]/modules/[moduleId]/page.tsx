'use client';

// app/admin/research/[sessionId]/modules/[moduleId]/page.tsx
// 研究模組編輯頁面

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface ResearchModule {
  id: string;
  moduleType: string;
  title_zh: string;
  title_en: string;
  conclusion_zh: string;
  conclusion_en: string;
  insight_zh: string;
  insight_en: string;
  tags: string[];
  supportingData: Record<string, any> | null;
  humanApproved: boolean;
  humanEdited: boolean;
  humanNotes: string | null;
  isReusable: boolean;
  usageCount: number;
  createdAt: string;
  sources?: {
    source: {
      id: string;
      title: string;
      url: string;
      domain: string;
    };
  }[];
}

export default function ModuleEditPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const moduleId = params.moduleId as string;

  const [module, setModule] = useState<ResearchModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [titleZh, setTitleZh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [conclusionZh, setConclusionZh] = useState('');
  const [conclusionEn, setConclusionEn] = useState('');
  const [insightZh, setInsightZh] = useState('');
  const [insightEn, setInsightEn] = useState('');
  const [tags, setTags] = useState('');
  const [humanNotes, setHumanNotes] = useState('');
  const [isReusable, setIsReusable] = useState(true);

  const fetchModule = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/research/modules/${moduleId}`);
      const data = await res.json();
      if (data.module) {
        setModule(data.module);
        setTitleZh(data.module.title_zh || '');
        setTitleEn(data.module.title_en || '');
        setConclusionZh(data.module.conclusion_zh || '');
        setConclusionEn(data.module.conclusion_en || '');
        setInsightZh(data.module.insight_zh || '');
        setInsightEn(data.module.insight_en || '');
        setTags(data.module.tags?.join(', ') || '');
        setHumanNotes(data.module.humanNotes || '');
        setIsReusable(data.module.isReusable);
      }
    } catch (error) {
      console.error('Error fetching module:', error);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  const saveModule = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/research/modules/${moduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_zh: titleZh,
          title_en: titleEn,
          conclusion_zh: conclusionZh,
          conclusion_en: conclusionEn,
          insight_zh: insightZh,
          insight_en: insightEn,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          humanNotes,
          isReusable,
          humanEdited: true,
        }),
      });
      
      if (res.ok) {
        router.push(`/admin/research/${sessionId}`);
      }
    } catch (error) {
      console.error('Error saving module:', error);
    } finally {
      setSaving(false);
    }
  };

  const approveModule = async () => {
    try {
      await fetch(`/api/admin/research/modules/${moduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ humanApproved: !module?.humanApproved }),
      });
      fetchModule();
    } catch (error) {
      console.error('Error approving module:', error);
    }
  };

  const deleteModule = async () => {
    if (!confirm('確定要刪除此模組嗎？此操作無法復原。')) return;
    
    try {
      await fetch(`/api/admin/research/modules/${moduleId}`, {
        method: 'DELETE',
      });
      router.push(`/admin/research/${sessionId}`);
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const copyInsight = () => {
    navigator.clipboard.writeText(insightZh);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const moduleTypeLabels: Record<string, string> = {
    TREND: '趨勢',
    MATERIAL: '材料',
    STRUCTURE: '結構',
    PROCESS: '技術/加工',
    CASE: '案例',
    MARKET_INSIGHT: '市場觀察',
    SUSTAINABILITY: '永續',
    INNOVATION: '創新',
    REGULATION: '法規',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-500">找不到模組</p>
        <Link
          href={`/admin/research/${sessionId}`}
          className="mt-4 text-zinc-900 underline"
        >
          返回研究任務
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href={`/admin/research/${sessionId}`}
            className="mt-1 rounded-lg p-2 hover:bg-zinc-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                {moduleTypeLabels[module.moduleType] || module.moduleType}
              </span>
              <h1 className="text-2xl font-bold text-zinc-900">編輯模組</h1>
              {module.humanApproved && (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  <CheckCircleIcon className="h-3 w-3" />
                  已核准
                </span>
              )}
              {module.humanEdited && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                  已編輯
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              使用次數: {module.usageCount} | 建立於{' '}
              {new Date(module.createdAt).toLocaleDateString('zh-TW')}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={approveModule}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              module.humanApproved
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'border border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <CheckCircleIcon className="h-4 w-4" />
            {module.humanApproved ? '已核准' : '核准'}
          </button>
          <button
            onClick={deleteModule}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-6">
        {/* 中文 */}
        <div className="space-y-4">
          <h2 className="font-semibold text-zinc-900">中文內容</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              標題
            </label>
            <input
              type="text"
              value={titleZh}
              onChange={(e) => setTitleZh(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              核心結論
            </label>
            <textarea
              value={conclusionZh}
              onChange={(e) => setConclusionZh(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-zinc-500">
              字數: {conclusionZh.length}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-700">
                觀點摘要 (可引用)
              </label>
              <button
                onClick={copyInsight}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
              >
                <DocumentDuplicateIcon className="h-3 w-3" />
                {copied ? '已複製!' : '複製'}
              </button>
            </div>
            <textarea
              value={insightZh}
              onChange={(e) => setInsightZh(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-zinc-500">
              字數: {insightZh.length} (建議 50-80 字)
            </p>
          </div>
        </div>

        {/* 英文 */}
        <div className="space-y-4">
          <h2 className="font-semibold text-zinc-900">English Content</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Title
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Conclusion
            </label>
            <textarea
              value={conclusionEn}
              onChange={(e) => setConclusionEn(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Words: {conclusionEn.split(/\s+/).filter(Boolean).length}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Insight (Quotable)
            </label>
            <textarea
              value={insightEn}
              onChange={(e) => setInsightEn(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Words: {insightEn.split(/\s+/).filter(Boolean).length}
            </p>
          </div>
        </div>
      </div>

      {/* Tags & Options */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            標籤 (用逗號分隔)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="sustainability, paper-packaging, e-commerce"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isReusable}
              onChange={(e) => setIsReusable(e.target.checked)}
              className="rounded border-zinc-300"
            />
            <span className="text-sm text-zinc-700">可重複使用</span>
          </label>
        </div>
      </div>

      {/* Human Notes */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          編輯備註
        </label>
        <textarea
          value={humanNotes}
          onChange={(e) => setHumanNotes(e.target.value)}
          rows={2}
          placeholder="記錄編輯理由或補充說明..."
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      {/* Sources */}
      {module.sources && module.sources.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-700">來源引用</h3>
          <div className="space-y-2">
            {module.sources.map(({ source }) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-zinc-200 p-3 hover:bg-zinc-50"
              >
                <div className="font-medium text-zinc-900">{source.title}</div>
                <div className="text-xs text-zinc-500">{source.domain}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-6">
        <Link
          href={`/admin/research/${sessionId}`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
        >
          取消
        </Link>
        <button
          onClick={saveModule}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {saving && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
          儲存變更
        </button>
      </div>
    </div>
  );
}
