'use client';

// app/admin/research/[sessionId]/drafts/[draftId]/page.tsx
// 編輯文章草稿

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface ArticleDraft {
  id: string;
  title_zh: string;
  title_en: string;
  content_zh: string;
  content_en: string;
  outline: any;
  status: string;
  seoKeywords: string[];
  metaDescription_zh: string;
  metaDescription_en: string;
  moduleUsages: {
    module: {
      id: string;
      title_zh: string;
      moduleType: string;
    };
  }[];
}

export default function DraftEditorPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const draftId = params.draftId as string;

  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [activeTab, setActiveTab] = useState<'zh' | 'en'>('zh');

  const [titleZh, setTitleZh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentZh, setContentZh] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [metaDescZh, setMetaDescZh] = useState('');
  const [metaDescEn, setMetaDescEn] = useState('');

  const fetchDraft = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/research/drafts/${draftId}`);
      const data = await res.json();
      const d = data.draft;
      setDraft(d);
      setTitleZh(d.title_zh || '');
      setTitleEn(d.title_en || '');
      setContentZh(d.content_zh || '');
      setContentEn(d.content_en || '');
      setSeoKeywords((d.seoKeywords || []).join(', '));
      setMetaDescZh(d.metaDescription_zh || '');
      setMetaDescEn(d.metaDescription_en || '');
    } catch (error) {
      console.error('Error fetching draft:', error);
    } finally {
      setLoading(false);
    }
  }, [draftId]);

  useEffect(() => {
    fetchDraft();
  }, [fetchDraft]);

  const saveDraft = async (newStatus?: string) => {
    setSaving(true);
    try {
      await fetch(`/api/admin/research/drafts/${draftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_zh: titleZh,
          title_en: titleEn,
          content_zh: contentZh,
          content_en: contentEn,
          seoKeywords: seoKeywords.split(',').map((k) => k.trim()).filter(Boolean),
          metaDescription_zh: metaDescZh,
          metaDescription_en: metaDescEn,
          ...(newStatus && { status: newStatus }),
        }),
      });
      await fetchDraft();
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const expandSection = async (sectionTitle: string) => {
    setExpanding(true);
    try {
      const res = await fetch(`/api/admin/research/drafts/${draftId}/expand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionTitle }),
      });
      const data = await res.json();
      
      if (data.content) {
        // 將擴展的內容插入
        setContentZh((prev) => prev + '\n\n' + data.content);
      }
    } catch (error) {
      console.error('Error expanding section:', error);
    } finally {
      setExpanding(false);
    }
  };

  const deleteDraft = async () => {
    if (!confirm('確定要刪除此草稿嗎？')) return;

    try {
      await fetch(`/api/admin/research/drafts/${draftId}`, {
        method: 'DELETE',
      });
      router.push(`/admin/research/${sessionId}`);
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    outline: { label: '大綱', color: 'bg-yellow-100 text-yellow-800' },
    draft: { label: '草稿', color: 'bg-blue-100 text-blue-800' },
    review: { label: '審核中', color: 'bg-purple-100 text-purple-800' },
    ready: { label: '待發布', color: 'bg-green-100 text-green-800' },
    published: { label: '已發布', color: 'bg-zinc-900 text-white' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-500">找不到草稿</p>
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
              <h1 className="text-2xl font-bold text-zinc-900">編輯草稿</h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${statusLabels[draft.status]?.color || 'bg-zinc-100'}`}
              >
                {statusLabels[draft.status]?.label || draft.status}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {draft.moduleUsages.map(({ module }) => (
                <span
                  key={module.id}
                  className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                >
                  {module.title_zh}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => saveDraft()}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
          >
            {saving ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <CheckIcon className="h-4 w-4" />
            )}
            儲存
          </button>
          <button
            onClick={() => saveDraft('ready')}
            disabled={saving}
            className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          >
            標記為待發布
          </button>
          <button
            onClick={deleteDraft}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="border-b border-zinc-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('zh')}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'zh'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500'
            }`}
          >
            中文
          </button>
          <button
            onClick={() => setActiveTab('en')}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'en'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              標題 {activeTab === 'en' && '(EN)'}
            </label>
            <input
              type="text"
              value={activeTab === 'zh' ? titleZh : titleEn}
              onChange={(e) =>
                activeTab === 'zh' ? setTitleZh(e.target.value) : setTitleEn(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-lg font-semibold focus:border-zinc-900 focus:outline-none"
            />
          </div>

          {/* Content */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700">
                內容 {activeTab === 'en' && '(EN)'}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(activeTab === 'zh' ? contentZh : contentEn)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  title="複製"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <textarea
              value={activeTab === 'zh' ? contentZh : contentEn}
              onChange={(e) =>
                activeTab === 'zh' ? setContentZh(e.target.value) : setContentEn(e.target.value)
              }
              rows={20}
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 font-mono text-sm focus:border-zinc-900 focus:outline-none"
            />
          </div>

          {/* Expand Section */}
          {draft.outline && draft.outline.sections && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <SparklesIcon className="h-4 w-4" />
                AI 擴展章節
              </div>
              <div className="flex flex-wrap gap-2">
                {draft.outline.sections.map((section: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => expandSection(section.title)}
                    disabled={expanding}
                    className="rounded-lg bg-white px-3 py-1.5 text-sm shadow-sm hover:shadow disabled:opacity-50"
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SEO Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="mb-3 font-semibold text-zinc-900">SEO 設定</h3>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  關鍵字
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="以逗號分隔"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Meta 描述 {activeTab === 'en' && '(EN)'}
                </label>
                <textarea
                  value={activeTab === 'zh' ? metaDescZh : metaDescEn}
                  onChange={(e) =>
                    activeTab === 'zh'
                      ? setMetaDescZh(e.target.value)
                      : setMetaDescEn(e.target.value)
                  }
                  rows={3}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                />
                <div className="mt-1 text-right text-xs text-zinc-400">
                  {(activeTab === 'zh' ? metaDescZh : metaDescEn).length}/160
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="mb-3 font-semibold text-zinc-900">統計</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">中文字數</span>
                <span>{contentZh.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">英文字數</span>
                <span>{contentEn.split(/\s+/).filter(Boolean).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">引用模組</span>
                <span>{draft.moduleUsages.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
