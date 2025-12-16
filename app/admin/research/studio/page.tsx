'use client';

// app/admin/research/studio/page.tsx
// MB Research Studio - 主頁面（研究任務列表）

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  BeakerIcon,
  PlusIcon,
  ArrowPathIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface ResearchSession {
  id: string;
  topic: string;
  status: string;
  focusAreas: string[];
  createdAt: string;
  _count: {
    modules: number;
    sources: number;
    conversations: number;
    articles: number;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  COLLECTING: { label: '收集中', color: 'bg-blue-100 text-blue-800', icon: ArrowPathIcon },
  ANALYZING: { label: '分析中', color: 'bg-purple-100 text-purple-800', icon: SparklesIcon },
  PENDING_REVIEW: { label: '待審核', color: 'bg-orange-100 text-orange-800', icon: ClockIcon },
  REVIEWED: { label: '已審核', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  WRITING: { label: '撰寫中', color: 'bg-cyan-100 text-cyan-800', icon: DocumentTextIcon },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  ARCHIVED: { label: '已封存', color: 'bg-zinc-100 text-zinc-800', icon: null },
};

const focusAreaLabels: Record<string, string> = {
  TREND: '趨勢分析',
  MATERIAL: '材料研究',
  TECHNOLOGY: '技術創新',
  SUSTAINABILITY: '永續發展',
  DESIGN: '設計趨勢',
  MARKET: '市場動態',
};

// 市場類型
const marketTypeOptions = [
  { value: 'all', label: '全部市場', desc: '消費+B2B' },
  { value: 'consumer', label: '消費品市場', desc: 'B2C 零售包裝' },
  { value: 'b2b', label: 'B2B 市場', desc: '工業/企業包裝' },
  { value: 'design', label: '設計導向', desc: '創意/設計案例' },
];

// 目標受眾
const targetAudienceOptions = [
  { value: 'brand_owner', label: '品牌主' },
  { value: 'designer', label: '設計師' },
  { value: 'manufacturer', label: '製造商' },
  { value: 'marketer', label: '行銷人員' },
  { value: 'procurement', label: '採購人員' },
];

// 產業標籤
const industryTagOptions = [
  { value: 'food', label: '食品' },
  { value: 'beverage', label: '飲料' },
  { value: 'cosmetics', label: '美妝' },
  { value: 'electronics', label: '電子' },
  { value: 'luxury', label: '精品' },
  { value: 'pharmaceutical', label: '醫藥' },
  { value: 'ecommerce', label: '電商' },
  { value: 'gift', label: '禮盒' },
];

export default function ResearchStudioPage() {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 新任務表單
  const [newTopic, setNewTopic] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['TREND']);
  const [researchDepth, setResearchDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [additionalUrls, setAdditionalUrls] = useState('');
  const [marketType, setMarketType] = useState('all');
  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [industryTags, setIndustryTags] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/research/v2/sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('無法載入研究任務');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!newTopic.trim()) return;
    
    setCreating(true);
    setError(null);
    
    try {
      const urls = additionalUrls
        .split('\n')
        .map(u => u.trim())
        .filter(u => u.startsWith('http'));

      const res = await fetch('/api/admin/research/v2/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: newTopic,
          focusAreas: selectedAreas,
          depth: researchDepth,
          additionalUrls: urls,
          marketType,
          targetAudience,
          industryTags,
          autoResearch: false  // 改為手動模式，先搜尋再選擇
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setNewTopic('');
        setAdditionalUrls('');
        setShowNewForm(false);
        fetchSessions();
      } else {
        setError(data.error || '建立失敗');
      }
    } catch (err) {
      console.error('Error creating session:', err);
      setError('建立研究任務失敗');
    } finally {
      setCreating(false);
    }
  };

  const toggleArea = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('確定要刪除這個研究任務嗎？此操作無法復原。')) {
      return;
    }
    
    setDeletingId(sessionId);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/research/v2/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        const data = await res.json();
        setError(data.error || '刪除失敗');
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('刪除研究任務失敗');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Research Studio</h1>
          <p className="text-zinc-500">AI 協助的包裝趨勢研究 × 半自動撰文系統 v2</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800"
        >
          <PlusIcon className="h-5 w-5" />
          新增研究
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-800">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            ✕
          </button>
        </div>
      )}

      {/* New Session Form */}
      {showNewForm && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">建立新研究任務</h2>
          
          <div className="space-y-4">
            {/* Topic */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                研究主題 *
              </label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="例如：2025 月餅包裝趨勢分析"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-900 focus:outline-none"
              />
            </div>

            {/* Focus Areas */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                研究焦點（可多選）
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(focusAreaLabels).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => toggleArea(value)}
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                      selectedAreas.includes(value)
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Research Depth */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                研究深度
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'quick', label: '快速', desc: '~5分鐘' },
                  { value: 'standard', label: '標準', desc: '~15分鐘' },
                  { value: 'deep', label: '深度', desc: '~30分鐘' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setResearchDepth(option.value as any)}
                    className={`flex-1 rounded-lg border p-3 text-center transition-colors ${
                      researchDepth === option.value
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className={`text-xs ${researchDepth === option.value ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Market Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                市場類型
              </label>
              <div className="grid grid-cols-4 gap-2">
                {marketTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMarketType(option.value)}
                    className={`rounded-lg border p-2 text-center transition-colors ${
                      marketType === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-zinc-500">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                目標受眾（可多選）
              </label>
              <div className="flex flex-wrap gap-2">
                {targetAudienceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTargetAudience(prev => 
                        prev.includes(option.value)
                          ? prev.filter(v => v !== option.value)
                          : [...prev, option.value]
                      );
                    }}
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                      targetAudience.includes(option.value)
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Industry Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                產業領域（可多選）
              </label>
              <div className="flex flex-wrap gap-2">
                {industryTagOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setIndustryTags(prev => 
                        prev.includes(option.value)
                          ? prev.filter(v => v !== option.value)
                          : [...prev, option.value]
                      );
                    }}
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                      industryTags.includes(option.value)
                        ? 'bg-green-600 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional URLs */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                初始參考網址（選填，每行一個）
              </label>
              <textarea
                value={additionalUrls}
                onChange={(e) => setAdditionalUrls(e.target.value)}
                placeholder="https://example.com/article1&#10;https://example.com/article2"
                rows={3}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 font-mono text-sm focus:border-zinc-900 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={createSession}
                disabled={creating || !newTopic.trim()}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    研究中...
                  </>
                ) : (
                  <>
                    <BeakerIcon className="h-4 w-4" />
                    開始研究
                  </>
                )}
              </button>
              <button
                onClick={() => setShowNewForm(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard
          icon={<BeakerIcon className="h-5 w-5 text-blue-600" />}
          value={sessions.length}
          label="研究任務"
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={<MagnifyingGlassIcon className="h-5 w-5 text-green-600" />}
          value={sessions.reduce((acc, s) => acc + s._count.sources, 0)}
          label="研究來源"
          bgColor="bg-green-100"
        />
        <StatCard
          icon={<DocumentTextIcon className="h-5 w-5 text-purple-600" />}
          value={sessions.reduce((acc, s) => acc + s._count.modules, 0)}
          label="知識模組"
          bgColor="bg-purple-100"
        />
        <StatCard
          icon={<ChatBubbleLeftRightIcon className="h-5 w-5 text-orange-600" />}
          value={sessions.reduce((acc, s) => acc + s._count.articles, 0)}
          label="文章草稿"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">研究任務列表</h2>
        
        {sessions.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
            <BeakerIcon className="mx-auto h-12 w-12 text-zinc-300" />
            <p className="mt-4 text-zinc-500">尚無研究任務</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="mt-4 text-zinc-900 underline hover:no-underline"
            >
              建立第一個研究任務
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard 
                key={session.id} 
                session={session} 
                onDelete={deleteSession}
                isDeleting={deletingId === session.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  value, 
  label, 
  bgColor 
}: { 
  icon: React.ReactNode; 
  value: number; 
  label: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg ${bgColor} p-2`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-zinc-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

function SessionCard({ 
  session, 
  onDelete,
  isDeleting 
}: { 
  session: ResearchSession; 
  onDelete: (id: string, e: React.MouseEvent) => void;
  isDeleting: boolean;
}) {
  const status = statusConfig[session.status] || statusConfig.COLLECTING;
  const StatusIcon = status.icon;

  return (
    <div className="relative rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/admin/research/studio/${session.id}`}
        className="block p-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-zinc-900">{session.topic || '未命名研究'}</h3>
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${status.color}`}>
                {StatusIcon && <StatusIcon className="h-3 w-3" />}
                {status.label}
              </span>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-1">
              {session.focusAreas.map((area) => (
                <span key={area} className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                  {focusAreaLabels[area] || area}
                </span>
              ))}
            </div>
          </div>
          
          <div className="text-right text-sm text-zinc-500 pr-8">
            <div>{new Date(session.createdAt).toLocaleDateString('zh-TW')}</div>
            <div className="mt-1 flex gap-3 text-xs">
              <span>{session._count.sources} 來源</span>
              <span>{session._count.modules} 模組</span>
              {session._count.articles > 0 && (
                <span className="text-green-600">{session._count.articles} 文章</span>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Delete Button */}
      <button
        onClick={(e) => onDelete(session.id, e)}
        disabled={isDeleting}
        className="absolute right-3 top-3 p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        title="刪除任務"
      >
        {isDeleting ? (
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
        ) : (
          <TrashIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
