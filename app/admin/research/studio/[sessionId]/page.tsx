'use client';

// app/admin/research/studio/[sessionId]/page.tsx
// 研究任務詳情 - 儀表板

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  SparklesIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

interface ResearchSession {
  id: string;
  topic: string;
  status: string;
  focusAreas: string[];
  createdAt: string;
  humanNotes?: string;
  marketType?: string;
  targetAudience?: string[];
  industryTags?: string[];
  sources: Source[];
  modules: Module[];
  conversations: { id: string }[];
  articles: Article[];
  _count: {
    modules: number;
    sources: number;
    conversations: number;
    articles: number;
  };
}

interface Source {
  id: string;
  url: string;
  title: string;
  domain: string;
  authorityScore: number;
  relevanceScore: number;
  isExcluded: boolean;
  summary?: string;
}

interface Module {
  id: string;
  moduleType: string;
  title_zh: string;
  conclusion_zh: string;
  insight_zh?: string;
  tags: string[];
  humanApproved: boolean;
  sources: { source: Source }[];
}

interface Article {
  id: string;
  title_zh: string;
  status: string;
  createdAt: string;
  wordCount?: number;
}

const moduleTypeLabels: Record<string, { label: string; color: string }> = {
  TREND: { label: '趨勢', color: 'bg-blue-100 text-blue-800' },
  MATERIAL: { label: '材料', color: 'bg-green-100 text-green-800' },
  STRUCTURE: { label: '結構', color: 'bg-purple-100 text-purple-800' },
  PROCESS: { label: '工藝', color: 'bg-orange-100 text-orange-800' },
  CASE: { label: '案例', color: 'bg-pink-100 text-pink-800' },
  MARKET_INSIGHT: { label: '市場', color: 'bg-cyan-100 text-cyan-800' },
  SUSTAINABILITY: { label: '永續', color: 'bg-emerald-100 text-emerald-800' },
  INNOVATION: { label: '創新', color: 'bg-yellow-100 text-yellow-800' },
};

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<ResearchSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'modules' | 'articles'>('overview');
  const [addingUrl, setAddingUrl] = useState(false);
  const [newUrls, setNewUrls] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/admin/research/v2/sessions/${sessionId}`);
      const data = await res.json();
      setSession(data.session);
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUrls = async () => {
    const urls = newUrls.split('\n').filter(u => u.trim().startsWith('http'));
    if (urls.length === 0) return;

    setAddingUrl(true);
    try {
      await fetch(`/api/admin/research/v2/sessions/${sessionId}/urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      setNewUrls('');
      fetchSession();
    } catch (error) {
      console.error('Error adding URLs:', error);
    } finally {
      setAddingUrl(false);
    }
  };

  const regenerateModules = async () => {
    setRegenerating(true);
    try {
      await fetch(`/api/admin/research/v2/sessions/${sessionId}/regenerate`, {
        method: 'POST'
      });
      fetchSession();
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const startChat = async () => {
    try {
      const res = await fetch('/api/admin/research/v2/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, topic: session?.topic })
      });
      const data = await res.json();
      if (data.conversationId) {
        router.push(`/admin/research/studio/${sessionId}/chat/${data.conversationId}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
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
      <div className="text-center py-12">
        <p className="text-zinc-500">找不到研究任務</p>
        <Link href="/admin/research/studio" className="text-blue-600 hover:underline">
          返回列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link 
            href="/admin/research/studio" 
            className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            返回列表
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">{session.topic || '未命名研究'}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
            <span>{new Date(session.createdAt).toLocaleDateString('zh-TW')}</span>
            <span>•</span>
            <span>{session._count.sources} 來源</span>
            <span>•</span>
            <span>{session._count.modules} 模組</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/admin/research/studio/${sessionId}/logs`}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
          >
            <ClipboardDocumentListIcon className="h-5 w-5" />
            日誌
          </Link>
          <Link
            href={`/admin/research/studio/${sessionId}/prompts`}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
          >
            <SparklesIcon className="h-5 w-5" />
            深度提示
          </Link>
          <Link
            href={`/admin/research/studio/${sessionId}/sources`}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            搜尋來源
          </Link>
          <Link
            href={`/admin/research/studio/${sessionId}/deep-research`}
            className="flex items-center gap-2 rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-purple-700 hover:bg-purple-100"
          >
            <SparklesIcon className="h-5 w-5" />
            深度研究
          </Link>
          <button
            onClick={startChat}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            研究對話
          </button>
          <Link
            href={`/admin/research/studio/${sessionId}/write`}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800"
          >
            <PencilSquareIcon className="h-5 w-5" />
            生成文章
          </Link>
          <Link
            href={`/admin/research/studio/${sessionId}/enhanced-article`}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white hover:from-blue-700 hover:to-purple-700"
          >
            <SparklesIcon className="h-5 w-5" />
            增強版文章 ✨
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <nav className="flex gap-6">
          {[
            { key: 'overview', label: '總覽' },
            { key: 'sources', label: `來源 (${session._count.sources})` },
            { key: 'modules', label: `模組 (${session._count.modules})` },
            { key: 'articles', label: `文章 (${session._count.articles})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab 
          session={session} 
          onAddUrls={() => setActiveTab('sources')}
          onStartChat={startChat}
          onGenerateModules={regenerateModules}
          regenerating={regenerating}
        />
      )}

      {activeTab === 'sources' && (
        <SourcesTab
          sources={session.sources}
          newUrls={newUrls}
          setNewUrls={setNewUrls}
          addingUrl={addingUrl}
          onAddUrls={addUrls}
        />
      )}

      {activeTab === 'modules' && (
        <ModulesTab
          modules={session.modules}
          regenerating={regenerating}
          onRegenerate={regenerateModules}
          sessionId={sessionId}
        />
      )}

      {activeTab === 'articles' && (
        <ArticlesTab
          articles={session.articles}
          sessionId={sessionId}
        />
      )}
    </div>
  );
}

// Overview Tab
function OverviewTab({ 
  session, 
  onAddUrls,
  onStartChat,
  onGenerateModules,
  regenerating
}: { 
  session: ResearchSession;
  onAddUrls: () => void;
  onStartChat: () => void;
  onGenerateModules: () => void;
  regenerating: boolean;
}) {
  const qualitySources = session.sources.filter(s => !s.isExcluded && s.authorityScore >= 60);
  const approvedModules = session.modules.filter(m => m.humanApproved);

  // 市場類型標籤
  const marketTypeLabels: Record<string, string> = {
    all: '全市場',
    consumer: '消費品市場',
    b2b: 'B2B 工業',
    design: '設計導向'
  };

  // 目標受眾標籤
  const audienceLabels: Record<string, string> = {
    brand_owner: '品牌商',
    designer: '設計師',
    manufacturer: '製造商',
    retailer: '零售商',
    importer: '進口商',
    marketer: '行銷人員'
  };

  // 產業標籤
  const industryLabels: Record<string, string> = {
    food: '食品',
    beverage: '飲料',
    cosmetics: '美妝',
    pharma: '醫藥',
    electronics: '電子',
    luxury: '精品',
    gift: '禮品',
    ecommerce: '電商'
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Quick Stats */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">研究摘要</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-zinc-600">高品質來源</span>
            <span className="font-medium">{qualitySources.length} / {session.sources.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">已核准模組</span>
            <span className="font-medium">{approvedModules.length} / {session.modules.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">文章草稿</span>
            <span className="font-medium">{session.articles.length}</span>
          </div>
        </div>
      </div>

      {/* Market Filters */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">市場篩選</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-zinc-600">市場類型</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              session.marketType === 'consumer' ? 'bg-blue-100 text-blue-800' :
              session.marketType === 'b2b' ? 'bg-purple-100 text-purple-800' :
              session.marketType === 'design' ? 'bg-pink-100 text-pink-800' :
              'bg-zinc-100 text-zinc-800'
            }`}>
              {marketTypeLabels[session.marketType || 'all'] || '全市場'}
            </span>
          </div>
          {session.targetAudience && session.targetAudience.length > 0 && (
            <div>
              <span className="text-zinc-600 text-sm block mb-1">目標受眾</span>
              <div className="flex flex-wrap gap-1">
                {session.targetAudience.map(a => (
                  <span key={a} className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs">
                    {audienceLabels[a] || a}
                  </span>
                ))}
              </div>
            </div>
          )}
          {session.industryTags && session.industryTags.length > 0 && (
            <div>
              <span className="text-zinc-600 text-sm block mb-1">產業領域</span>
              <div className="flex flex-wrap gap-1">
                {session.industryTags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs">
                    {industryLabels[t] || t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {!session.marketType && (!session.targetAudience || session.targetAudience.length === 0) && 
           (!session.industryTags || session.industryTags.length === 0) && (
            <p className="text-xs text-zinc-500">未設定市場篩選條件</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">快速操作</h3>
        <div className="space-y-2">
          <button
            onClick={onAddUrls}
            className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 p-3 text-left hover:bg-zinc-50"
          >
            <LinkIcon className="h-5 w-5 text-zinc-400" />
            <div>
              <div className="font-medium">添加研究來源</div>
              <div className="text-xs text-zinc-500">貼上網址深入研究</div>
            </div>
          </button>
          <button
            onClick={onStartChat}
            className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 p-3 text-left hover:bg-zinc-50"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-zinc-400" />
            <div>
              <div className="font-medium">研究對話</div>
              <div className="text-xs text-zinc-500">與 AI 討論研究內容</div>
            </div>
          </button>
          <button
            onClick={onGenerateModules}
            disabled={regenerating || session.sources.filter(s => !s.isExcluded).length === 0}
            className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 p-3 text-left hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SparklesIcon className={`h-5 w-5 text-zinc-400 ${regenerating ? 'animate-spin' : ''}`} />
            <div>
              <div className="font-medium">{regenerating ? '生成中...' : '生成研究模組'}</div>
              <div className="text-xs text-zinc-500">AI 分析來源生成模組</div>
            </div>
          </button>
        </div>
      </div>

      {/* Top Modules Preview */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">核心研究模組</h3>
          {session.modules.length === 0 && session.sources.filter(s => !s.isExcluded).length > 0 && (
            <button
              onClick={onGenerateModules}
              disabled={regenerating}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              <SparklesIcon className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? '生成中...' : '生成模組'}
            </button>
          )}
        </div>
        {session.modules.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-zinc-300" />
            <p className="mt-2 text-zinc-500">尚無研究模組</p>
            {session.sources.filter(s => !s.isExcluded).length === 0 ? (
              <p className="mt-1 text-xs text-zinc-400">請先添加研究來源</p>
            ) : (
              <p className="mt-1 text-xs text-zinc-400">
                已有 {session.sources.filter(s => !s.isExcluded).length} 個來源可供分析
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {session.modules.slice(0, 4).map((module) => (
              <ModuleCard key={module.id} module={module} sessionId={session.id} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Sources Tab
function SourcesTab({
  sources,
  newUrls,
  setNewUrls,
  addingUrl,
  onAddUrls
}: {
  sources: Source[];
  newUrls: string;
  setNewUrls: (v: string) => void;
  addingUrl: boolean;
  onAddUrls: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Add URLs */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="mb-3 font-medium">添加研究來源</h3>
        <textarea
          value={newUrls}
          onChange={(e) => setNewUrls(e.target.value)}
          placeholder="貼上網址，每行一個..."
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
        />
        <button
          onClick={onAddUrls}
          disabled={addingUrl || !newUrls.trim()}
          className="mt-2 flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {addingUrl ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              處理中...
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4" />
              添加並分析
            </>
          )}
        </button>
      </div>

      {/* Sources List */}
      <div className="space-y-3">
        {sources.map((source) => (
          <div
            key={source.id}
            className={`rounded-lg border p-4 ${
              source.isExcluded ? 'border-zinc-100 bg-zinc-50 opacity-60' : 'border-zinc-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-zinc-900 hover:text-blue-600"
                >
                  {source.title}
                </a>
                <div className="mt-1 text-xs text-zinc-500">{source.domain}</div>
                {source.summary && (
                  <p className="mt-2 text-sm text-zinc-600 line-clamp-2">{source.summary}</p>
                )}
              </div>
              <div className="ml-4 flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">權威</span>
                  <ScoreBadge score={source.authorityScore} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">相關</span>
                  <ScoreBadge score={source.relevanceScore} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Modules Tab
function ModulesTab({
  modules,
  regenerating,
  onRegenerate,
  sessionId
}: {
  modules: Module[];
  regenerating: boolean;
  onRegenerate: () => void;
  sessionId: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">研究模組</h3>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50"
        >
          <SparklesIcon className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
          重新生成
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
          <DocumentTextIcon className="mx-auto h-10 w-10 text-zinc-300" />
          <p className="mt-2 text-zinc-500">尚無研究模組</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} sessionId={sessionId} />
          ))}
        </div>
      )}
    </div>
  );
}

// Articles Tab
function ArticlesTab({
  articles,
  sessionId
}: {
  articles: Article[];
  sessionId: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">文章草稿</h3>
        <Link
          href={`/admin/research/studio/${sessionId}/write`}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800"
        >
          <PlusIcon className="h-4 w-4" />
          生成新文章
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
          <PencilSquareIcon className="mx-auto h-10 w-10 text-zinc-300" />
          <p className="mt-2 text-zinc-500">尚無文章草稿</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/admin/research/studio/${sessionId}/write/${article.id}`}
              className="block rounded-lg border border-zinc-200 bg-white p-4 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{article.title_zh}</h4>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  article.status === 'published' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {article.status === 'published' ? '已發布' : '草稿'}
                </span>
              </div>
              <div className="mt-1 text-sm text-zinc-500">
                {new Date(article.createdAt).toLocaleDateString('zh-TW')}
                {article.wordCount && ` • ${article.wordCount} 字`}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Module Card Component
function ModuleCard({ module, sessionId, compact = false }: { module: Module; sessionId?: string; compact?: boolean }) {
  const typeConfig = moduleTypeLabels[module.moduleType] || { label: module.moduleType, color: 'bg-zinc-100 text-zinc-800' };

  const content = (
    <div className={`rounded-lg border border-zinc-200 bg-white p-4 ${sessionId ? 'hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <span className={`rounded-full px-2 py-0.5 text-xs ${typeConfig.color}`}>
          {typeConfig.label}
        </span>
        {module.humanApproved && (
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
        )}
      </div>
      <h4 className="mt-2 font-medium text-zinc-900">{module.title_zh}</h4>
      {!compact && (
        <>
          <p className="mt-2 text-sm text-zinc-600 line-clamp-3">{module.conclusion_zh}</p>
          {module.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {module.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {sessionId && (
            <div className="mt-3 pt-2 border-t border-zinc-100 text-xs text-zinc-500">
              點擊查看詳情
            </div>
          )}
        </>
      )}
    </div>
  );

  if (sessionId) {
    return (
      <Link href={`/admin/research/studio/${sessionId}/modules/${module.id}`}>
        {content}
      </Link>
    );
  }

  return content;
}

// Score Badge Component
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-100 text-green-800' 
    : score >= 60 ? 'bg-yellow-100 text-yellow-800'
    : 'bg-red-100 text-red-800';
  
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${color}`}>
      {Math.round(score)}
    </span>
  );
}
