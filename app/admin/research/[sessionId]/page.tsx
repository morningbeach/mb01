'use client';

// app/admin/research/[sessionId]/page.tsx
// 研究任務詳情頁面

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BeakerIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  PencilIcon,
  PlayIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface ResearchModule {
  id: string;
  moduleType: string;
  title_zh: string;
  summary_zh: string;
  conclusion_zh: string;
  keyPoints: string[];
  humanApproved: boolean;
  createdAt: string;
}

interface ResearchSource {
  source: {
    id: string;
    title: string;
    url: string;
    sourceType: string;
  };
  relevanceScore: number;
}

interface ArticleDraft {
  id: string;
  title_zh: string;
  status: string;
  updatedAt: string;
}

interface ResearchSession {
  id: string;
  topic: string;
  status: string;
  focusAreas: string[];
  searchKeywords: string[];
  createdAt: string;
  modules: ResearchModule[];
  sources: ResearchSource[];
  drafts: ArticleDraft[];
}

export default function ResearchSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<ResearchSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'modules' | 'sources' | 'drafts'>('modules');

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/research/sessions/${sessionId}`);
      const data = await res.json();
      setSession(data.session);
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const collectData = async () => {
    setCollecting(true);
    try {
      await fetch(`/api/admin/research/sessions/${sessionId}/collect`, {
        method: 'POST',
      });
      fetchSession();
    } catch (error) {
      console.error('Error collecting data:', error);
    } finally {
      setCollecting(false);
    }
  };

  const analyzeData = async () => {
    setAnalyzing(true);
    try {
      await fetch(`/api/admin/research/sessions/${sessionId}/analyze`, {
        method: 'POST',
      });
      fetchSession();
    } catch (error) {
      console.error('Error analyzing data:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const approveModule = async (moduleId: string, approved: boolean) => {
    try {
      await fetch(`/api/admin/research/modules/${moduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ humanApproved: approved }),
      });
      fetchSession();
    } catch (error) {
      console.error('Error updating module:', error);
    }
  };

  const deleteSession = async () => {
    if (!confirm('確定要刪除此研究任務嗎？此操作無法復原。')) return;

    try {
      await fetch(`/api/admin/research/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      router.push('/admin/research');
    } catch (error) {
      console.error('Error deleting session:', error);
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

  const statusLabels: Record<string, { label: string; color: string }> = {
    COLLECTING: { label: '收集中', color: 'bg-blue-100 text-blue-800' },
    ANALYZING: { label: '分析中', color: 'bg-purple-100 text-purple-800' },
    PENDING_REVIEW: { label: '待審核', color: 'bg-orange-100 text-orange-800' },
    REVIEWED: { label: '已審核', color: 'bg-green-100 text-green-800' },
    WRITING: { label: '撰寫中', color: 'bg-cyan-100 text-cyan-800' },
    COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-800' },
    ARCHIVED: { label: '已封存', color: 'bg-zinc-100 text-zinc-800' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-500">找不到研究任務</p>
        <Link href="/admin/research" className="mt-4 text-zinc-900 underline">
          返回列表
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
            href="/admin/research"
            className="mt-1 rounded-lg p-2 hover:bg-zinc-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900">{session.topic}</h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${statusLabels[session.status]?.color || 'bg-zinc-100'}`}
              >
                {statusLabels[session.status]?.label || session.status}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {session.focusAreas.map((area) => (
                <span
                  key={area}
                  className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                >
                  {moduleTypeLabels[area] || area}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={collectData}
            disabled={collecting}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
          >
            {collecting ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
            收集資料
          </button>
          <button
            onClick={analyzeData}
            disabled={analyzing || session.sources.length === 0}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
          >
            {analyzing ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <BeakerIcon className="h-4 w-4" />
            )}
            分析生成
          </button>
          <Link
            href={`/admin/research/${sessionId}/chat`}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            AI 對話
          </Link>
          <button
            onClick={deleteSession}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('modules')}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'modules'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            研究模組 ({session.modules.length})
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'sources'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            資料來源 ({session.sources.length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'drafts'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            文章草稿 ({session.drafts.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          {session.modules.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-zinc-500">尚無研究模組</p>
              <p className="text-sm text-zinc-400">請先收集資料，再進行分析生成</p>
            </div>
          ) : (
            session.modules.map((module) => (
              <div
                key={module.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                        {moduleTypeLabels[module.moduleType] || module.moduleType}
                      </span>
                      <h3 className="font-semibold text-zinc-900">{module.title_zh}</h3>
                      {module.humanApproved && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="mt-2 text-sm text-zinc-600">{module.summary_zh}</p>
                    {module.keyPoints && module.keyPoints.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-zinc-500">重點：</div>
                        <ul className="mt-1 space-y-1">
                          {module.keyPoints.slice(0, 3).map((point, i) => (
                            <li key={i} className="text-sm text-zinc-600">
                              • {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveModule(module.id, !module.humanApproved)}
                      className={`rounded-lg p-2 ${
                        module.humanApproved
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'
                      }`}
                      title={module.humanApproved ? '取消核准' : '核准模組'}
                    >
                      {module.humanApproved ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <XCircleIcon className="h-5 w-5" />
                      )}
                    </button>
                    <Link
                      href={`/admin/research/${sessionId}/modules/${module.id}`}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="space-y-3">
          {session.sources.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-zinc-500">尚無資料來源</p>
              <button
                onClick={collectData}
                disabled={collecting}
                className="mt-4 text-zinc-900 underline hover:no-underline"
              >
                開始收集資料
              </button>
            </div>
          ) : (
            session.sources.map(({ source, relevanceScore }) => (
              <div
                key={source.id}
                className="rounded-lg border border-zinc-200 bg-white p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {source.title}
                    </a>
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5">
                        {source.sourceType}
                      </span>
                      <span>相關度: {Math.round(relevanceScore * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'drafts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link
              href={`/admin/research/${sessionId}/drafts/new`}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
            >
              <DocumentTextIcon className="h-4 w-4" />
              建立草稿
            </Link>
          </div>

          {session.drafts.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-zinc-500">尚無文章草稿</p>
            </div>
          ) : (
            session.drafts.map((draft) => (
              <Link
                key={draft.id}
                href={`/admin/research/${sessionId}/drafts/${draft.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-900">{draft.title_zh}</h3>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {draft.status}
                  </span>
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  更新於 {new Date(draft.updatedAt).toLocaleString('zh-TW')}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
