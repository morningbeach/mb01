'use client';

// app/admin/research/studio/[sessionId]/modules/[moduleId]/page.tsx
// 研究模組詳情頁面 - 含引用推薦系統

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  LinkIcon,
  DocumentTextIcon,
  TagIcon,
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon,
  BookOpenIcon,
  StarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface SourceWithCitation {
  id: string;
  url: string;
  title: string;
  domain: string;
  authorityScore: number;
  originalityScore: number;
  relevanceScore: number;
  sourceType: string;
  summary?: string;
  isLinked: boolean;
  citationScore: number;
  citationReason: string;
  citationPriority: 'high' | 'medium' | 'low';
  suggestedUsage: string;
}

interface ModuleDetail {
  id: string;
  moduleType: string;
  title_zh: string;
  title_en?: string;
  conclusion_zh: string;
  conclusion_en?: string;
  insight_zh?: string;
  insight_en?: string;
  tags: string[];
  humanApproved: boolean;
  humanNotes?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  supportingData?: {
    confidenceScore: number;
    facts: {
      statement: string;
      confidence: number;
      sourceUrl?: string;
    }[];
  };
  sources: {
    source: {
      id: string;
      url: string;
      title: string;
      domain: string;
      authorityScore: number;
      relevanceScore: number;
      summary?: string;
    };
  }[];
}

interface SourceStats {
  totalSources: number;
  linkedSources: number;
  highPriority: number;
  mediumPriority: number;
}

const moduleTypeLabels: Record<string, { label: string; color: string; description: string }> = {
  TREND: { label: '趨勢分析', color: 'bg-blue-100 text-blue-800', description: '市場動態與產業發展趨勢' },
  MATERIAL: { label: '材料研究', color: 'bg-green-100 text-green-800', description: '包裝材料特性與應用' },
  STRUCTURE: { label: '結構設計', color: 'bg-purple-100 text-purple-800', description: '包裝結構與工程設計' },
  PROCESS: { label: '工藝技術', color: 'bg-orange-100 text-orange-800', description: '生產工藝與製程技術' },
  CASE: { label: '案例研究', color: 'bg-pink-100 text-pink-800', description: '品牌案例與應用實例' },
  MARKET_INSIGHT: { label: '市場洞察', color: 'bg-cyan-100 text-cyan-800', description: '市場規模與競爭分析' },
  SUSTAINABILITY: { label: '永續發展', color: 'bg-emerald-100 text-emerald-800', description: '環保材料與永續實踐' },
  INNOVATION: { label: '創新應用', color: 'bg-yellow-100 text-yellow-800', description: '新技術與創新方案' },
};

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const moduleId = params.moduleId as string;

  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [allSources, setAllSources] = useState<SourceWithCitation[]>([]);
  const [sourceStats, setSourceStats] = useState<SourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAllSources, setShowAllSources] = useState(false);
  
  // 編輯狀態
  const [editTitle, setEditTitle] = useState('');
  const [editConclusion, setEditConclusion] = useState('');
  const [editInsight, setEditInsight] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    fetchModule();
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      const res = await fetch(`/api/admin/research/v2/modules/${moduleId}`);
      const data = await res.json();
      setModule(data.module);
      setAllSources(data.allSources || []);
      setSourceStats(data.stats || null);
      
      // 初始化編輯值
      if (data.module) {
        setEditTitle(data.module.title_zh || '');
        setEditConclusion(data.module.conclusion_zh || '');
        setEditInsight(data.module.insight_zh || '');
        setEditTags(data.module.tags?.join(', ') || '');
        setEditNotes(data.module.humanNotes || '');
      }
    } catch (error) {
      console.error('Error fetching module:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/research/v2/modules/${moduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_zh: editTitle,
          conclusion_zh: editConclusion,
          insight_zh: editInsight,
          tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
          humanNotes: editNotes
        })
      });
      
      if (res.ok) {
        await fetchModule();
        setEditing(false);
      }
    } catch (error) {
      console.error('Error saving module:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleApproval = async () => {
    try {
      await fetch(`/api/admin/research/v2/modules/${moduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          humanApproved: !module?.humanApproved
        })
      });
      fetchModule();
    } catch (error) {
      console.error('Error toggling approval:', error);
    }
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
      <div className="text-center py-12">
        <p className="text-zinc-500">找不到研究模組</p>
        <Link href={`/admin/research/studio/${sessionId}`} className="text-blue-600 hover:underline">
          返回研究
        </Link>
      </div>
    );
  }

  const typeConfig = moduleTypeLabels[module.moduleType] || { 
    label: module.moduleType, 
    color: 'bg-zinc-100 text-zinc-800',
    description: '研究模組'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link 
            href={`/admin/research/studio/${sessionId}`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            返回研究
          </Link>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-sm ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
            {module.humanApproved && (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircleIcon className="h-4 w-4" />
                已核准
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            {editing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border-b-2 border-zinc-300 pb-1 focus:border-zinc-900 focus:outline-none"
              />
            ) : (
              module.title_zh
            )}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{typeConfig.description}</p>
        </div>

        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
              >
                取消
              </button>
              <button
                onClick={saveChanges}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : null}
                儲存變更
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleApproval}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${
                  module.humanApproved 
                    ? 'border-red-300 text-red-600 hover:bg-red-50'
                    : 'border-green-300 text-green-600 hover:bg-green-50'
                }`}
              >
                {module.humanApproved ? (
                  <>
                    <XCircleIcon className="h-4 w-4" />
                    取消核准
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    核准模組
                  </>
                )}
              </button>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
              >
                <PencilIcon className="h-4 w-4" />
                編輯
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard 
          icon={ChartBarIcon}
          label="信心分數"
          value={`${module.supportingData?.confidenceScore || 0}%`}
        />
        <StatCard 
          icon={BookOpenIcon}
          label="參考來源"
          value={`${module.sources.length} 個`}
        />
        <StatCard 
          icon={DocumentTextIcon}
          label="使用次數"
          value={`${module.usageCount} 次`}
        />
        <StatCard 
          icon={ClockIcon}
          label="建立時間"
          value={new Date(module.createdAt).toLocaleDateString('zh-TW')}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Conclusion & Insight */}
        <div className="space-y-6 lg:col-span-2">
          {/* Conclusion */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <DocumentTextIcon className="h-5 w-5 text-zinc-400" />
              研究結論
            </h3>
            {editing ? (
              <textarea
                value={editConclusion}
                onChange={(e) => setEditConclusion(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-zinc-300 p-3 focus:border-zinc-500 focus:outline-none"
              />
            ) : (
              <p className="text-zinc-700 whitespace-pre-wrap leading-relaxed">
                {module.conclusion_zh}
              </p>
            )}
          </div>

          {/* Insight */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <LightBulbIcon className="h-5 w-5 text-yellow-500" />
              核心洞察
            </h3>
            {editing ? (
              <textarea
                value={editInsight}
                onChange={(e) => setEditInsight(e.target.value)}
                rows={4}
                placeholder="這個研究帶來的關鍵洞察..."
                className="w-full rounded-lg border border-zinc-300 p-3 focus:border-zinc-500 focus:outline-none"
              />
            ) : module.insight_zh ? (
              <p className="text-zinc-700 whitespace-pre-wrap leading-relaxed">
                {module.insight_zh}
              </p>
            ) : (
              <p className="text-zinc-400 italic">尚未添加洞察</p>
            )}
          </div>

          {/* Supporting Facts */}
          {module.supportingData?.facts && module.supportingData.facts.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 font-semibold">支撐事實</h3>
              <div className="space-y-3">
                {module.supportingData.facts.map((fact, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg bg-zinc-50 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-700">{fact.statement}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                        <span>信心度: {Math.round(fact.confidence * 100)}%</span>
                        {fact.sourceUrl && (
                          <a 
                            href={fact.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <LinkIcon className="h-3 w-3" />
                            來源
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Human Notes */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 font-semibold">人工註記</h3>
            {editing ? (
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                placeholder="添加你的備註..."
                className="w-full rounded-lg border border-zinc-300 p-3 focus:border-zinc-500 focus:outline-none"
              />
            ) : module.humanNotes ? (
              <p className="text-zinc-700">{module.humanNotes}</p>
            ) : (
              <p className="text-zinc-400 italic">尚無註記</p>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <TagIcon className="h-5 w-5 text-zinc-400" />
              標籤
            </h3>
            {editing ? (
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="標籤1, 標籤2, 標籤3"
                className="w-full rounded-lg border border-zinc-300 p-2 text-sm focus:border-zinc-500 focus:outline-none"
              />
            ) : module.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {module.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400 italic text-sm">尚無標籤</p>
            )}
          </div>

          {/* Sources - 引用推薦系統 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold">
                <StarIcon className="h-5 w-5 text-yellow-500" />
                引用推薦
              </h3>
              {sourceStats && (
                <span className="text-xs text-zinc-500">
                  {sourceStats.highPriority} 高 / {sourceStats.mediumPriority} 中
                </span>
              )}
            </div>
            
            {/* 統計摘要 */}
            {sourceStats && (
              <div className="mb-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-green-50 p-2">
                  <div className="text-lg font-bold text-green-700">{sourceStats.highPriority}</div>
                  <div className="text-xs text-green-600">強烈推薦</div>
                </div>
                <div className="rounded-lg bg-yellow-50 p-2">
                  <div className="text-lg font-bold text-yellow-700">{sourceStats.mediumPriority}</div>
                  <div className="text-xs text-yellow-600">建議引用</div>
                </div>
              </div>
            )}
            
            {allSources.length === 0 ? (
              <p className="text-zinc-400 italic text-sm">尚無來源</p>
            ) : (
              <div className="space-y-3">
                {allSources
                  .slice(0, showAllSources ? undefined : 5)
                  .map((source) => (
                  <SourceCitationCard key={source.id} source={source} />
                ))}
                
                {allSources.length > 5 && (
                  <button
                    onClick={() => setShowAllSources(!showAllSources)}
                    className="w-full rounded-lg border border-zinc-200 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                  >
                    {showAllSources ? '收起' : `顯示全部 ${allSources.length} 個來源`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* English Version */}
          {module.title_en && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 font-semibold">English Version</h3>
              <h4 className="font-medium text-zinc-900">{module.title_en}</h4>
              {module.conclusion_en && (
                <p className="mt-2 text-sm text-zinc-600">{module.conclusion_en}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4">
      <div className="rounded-lg bg-zinc-100 p-2">
        <Icon className="h-5 w-5 text-zinc-600" />
      </div>
      <div>
        <div className="text-xs text-zinc-500">{label}</div>
        <div className="font-semibold text-zinc-900">{value}</div>
      </div>
    </div>
  );
}

// 來源引用推薦卡片
function SourceCitationCard({ source }: { source: SourceWithCitation }) {
  const priorityConfig = {
    high: { 
      label: '強烈推薦', 
      bgColor: 'bg-green-50 border-green-200', 
      badgeColor: 'bg-green-100 text-green-700',
      starColor: 'text-green-500'
    },
    medium: { 
      label: '建議引用', 
      bgColor: 'bg-yellow-50 border-yellow-200', 
      badgeColor: 'bg-yellow-100 text-yellow-700',
      starColor: 'text-yellow-500'
    },
    low: { 
      label: '可選參考', 
      bgColor: 'bg-zinc-50 border-zinc-200', 
      badgeColor: 'bg-zinc-100 text-zinc-600',
      starColor: 'text-zinc-400'
    }
  };
  
  const config = priorityConfig[source.citationPriority];
  
  return (
    <div className={`rounded-lg border p-3 ${config.bgColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-sm font-medium text-zinc-900 hover:text-blue-600 line-clamp-2"
        >
          {source.title}
        </a>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-lg font-bold ${config.starColor}`}>
            {source.citationScore}
          </span>
          <StarSolidIcon className={`h-4 w-4 ${config.starColor}`} />
        </div>
      </div>
      
      {/* Domain & Badge */}
      <div className="mt-1 flex items-center gap-2">
        <span className="text-xs text-zinc-500">{source.domain}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs ${config.badgeColor}`}>
          {config.label}
        </span>
        {source.isLinked && (
          <span className="flex items-center gap-0.5 text-xs text-blue-600">
            <CheckIcon className="h-3 w-3" />
            已連結
          </span>
        )}
      </div>
      
      {/* Citation Reason */}
      <div className="mt-2 text-xs text-zinc-600">
        <span className="font-medium">推薦原因：</span>{source.citationReason}
      </div>
      
      {/* Suggested Usage */}
      <div className="mt-1 text-xs text-zinc-500 italic">
        {source.suggestedUsage}
      </div>
      
      {/* Scores */}
      <div className="mt-2 flex gap-3 text-xs">
        <ScoreBadge label="權威" score={source.authorityScore} />
        <ScoreBadge label="原創" score={source.originalityScore} />
        <ScoreBadge label="相關" score={source.relevanceScore} />
      </div>
    </div>
  );
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
  const colorClass = score >= 70 
    ? 'text-green-600' 
    : score >= 50 
      ? 'text-yellow-600' 
      : 'text-red-500';
  
  return (
    <span className="flex items-center gap-1">
      {label}: <span className={`font-medium ${colorClass}`}>{Math.round(score)}</span>
    </span>
  );
}
