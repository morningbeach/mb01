'use client';

// app/admin/research/studio/[sessionId]/sources/page.tsx
// 來源選擇頁面 - 預覽搜尋結果，選擇要抓取的連結

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  LinkIcon,
  GlobeAltIcon,
  StarIcon,
  DocumentMagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

interface SearchResult {
  id: string;
  url: string;
  title: string;
  snippet: string;
  domain: string;
  estimatedScore: number;
  sourceType: string;
  selected: boolean;
  position: number;
}

const sourceTypeLabels: Record<string, { label: string; color: string }> = {
  'ACADEMIC_PAPER': { label: '學術研究', color: 'bg-purple-100 text-purple-700' },
  'MARKET_ANALYSIS': { label: '市場分析', color: 'bg-blue-100 text-blue-700' },
  'CASE_STUDY': { label: '案例研究', color: 'bg-pink-100 text-pink-700' },
  'TRADE_NEWS': { label: '產業新聞', color: 'bg-cyan-100 text-cyan-700' },
  'MANUFACTURER_BLOG': { label: '廠商資訊', color: 'bg-orange-100 text-orange-700' },
  'OTHER': { label: '其他', color: 'bg-zinc-100 text-zinc-700' }
};

interface ProgressLog {
  id: number;
  type: 'start' | 'progress' | 'item_success' | 'item_failed' | 'complete' | 'error';
  message: string;
  timestamp: Date;
  data?: any;
}

export default function SourceSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<any>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [scrapingProgress, setScrapingProgress] = useState<string>('');
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [scrapeStats, setScrapeStats] = useState({ current: 0, total: 0, success: 0, failed: 0 });

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/admin/research/v2/sessions/${sessionId}`);
      const data = await res.json();
      setSession(data.session);

      // 如果有暫存的搜尋結果，載入
      if (data.session?.humanNotes) {
        try {
          const notes = JSON.parse(data.session.humanNotes);
          if (notes.searchResults) {
            setResults(notes.searchResults);
          }
        } catch (e) {
          // 不是 JSON，忽略
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = async () => {
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/research/v2/sessions/${sessionId}/search`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        setResults(data.results);
      } else {
        alert('搜尋失敗: ' + (data.error || '未知錯誤'));
      }
    } catch (error: any) {
      alert('搜尋錯誤: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  const toggleSelect = (id: string) => {
    setResults(prev => prev.map(r => 
      r.id === id ? { ...r, selected: !r.selected } : r
    ));
  };

  const selectAll = () => {
    setResults(prev => prev.map(r => ({ ...r, selected: true })));
  };

  const deselectAll = () => {
    setResults(prev => prev.map(r => ({ ...r, selected: false })));
  };

  const selectByScore = (minScore: number) => {
    setResults(prev => prev.map(r => ({ 
      ...r, 
      selected: r.estimatedScore >= minScore 
    })));
  };

  const executeScrape = async () => {
    const selectedUrls = results.filter(r => r.selected).map(r => ({
      url: r.url,
      title: r.title
    }));

    if (selectedUrls.length === 0) {
      alert('請至少選擇一個連結');
      return;
    }

    setScraping(true);
    setProgressLogs([]);
    setScrapeStats({ current: 0, total: selectedUrls.length, success: 0, failed: 0 });
    setScrapingProgress(`準備抓取 ${selectedUrls.length} 個連結...`);

    let logIdCounter = 0;
    const addLog = (type: ProgressLog['type'], message: string, data?: any) => {
      setProgressLogs(prev => [...prev, {
        id: logIdCounter++,
        type,
        message,
        timestamp: new Date(),
        data
      }]);
    };

    try {
      const res = await fetch(`/api/admin/research/v2/sessions/${sessionId}/scrape-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedUrls })
      });

      if (!res.ok) {
        throw new Error('連線失敗');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('無法讀取串流');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'start':
                  addLog('start', data.message, data);
                  setScrapeStats(prev => ({ ...prev, total: data.total }));
                  break;
                  
                case 'progress':
                  setScrapingProgress(data.message);
                  setScrapeStats(prev => ({ ...prev, current: data.current }));
                  addLog('progress', data.message, data);
                  break;
                  
                case 'item_success':
                  addLog('item_success', data.message, data);
                  setScrapeStats(prev => ({ ...prev, success: prev.success + 1 }));
                  break;
                  
                case 'item_failed':
                  addLog('item_failed', data.message, data);
                  setScrapeStats(prev => ({ ...prev, failed: prev.failed + 1 }));
                  break;
                  
                case 'complete':
                  addLog('complete', data.message, data);
                  setScrapingProgress(data.message);
                  // 3 秒後跳轉
                  setTimeout(() => {
                    router.push(`/admin/research/studio/${sessionId}`);
                  }, 3000);
                  break;
                  
                case 'error':
                  addLog('error', data.message, data);
                  setScrapingProgress('錯誤: ' + data.message);
                  break;
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error: any) {
      addLog('error', '抓取錯誤: ' + error.message);
      setScrapingProgress('錯誤: ' + error.message);
    } finally {
      // 不立即關閉 scraping，讓用戶看到完成訊息
      setTimeout(() => {
        setScraping(false);
      }, 3500);
    }
  };

  const filteredResults = results.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'high') return r.estimatedScore >= 70;
    if (filter === 'medium') return r.estimatedScore >= 50 && r.estimatedScore < 70;
    if (filter === 'low') return r.estimatedScore < 50;
    return true;
  });

  const selectedCount = results.filter(r => r.selected).length;

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
      <div className="flex items-start justify-between">
        <div>
          <Link 
            href={`/admin/research/studio/${sessionId}`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            返回研究
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">來源選擇</h1>
          <p className="mt-1 text-zinc-500">
            主題: {session?.topic || '未知'}
          </p>
        </div>

        <div className="flex gap-2">
          {results.length === 0 ? (
            <button
              onClick={executeSearch}
              disabled={searching}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {searching ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <MagnifyingGlassIcon className="h-4 w-4" />
              )}
              {searching ? '搜尋中...' : '開始搜尋'}
            </button>
          ) : (
            <>
              <button
                onClick={executeSearch}
                disabled={searching || scraping}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 ${searching ? 'animate-spin' : ''}`} />
                重新搜尋
              </button>
              <button
                onClick={executeScrape}
                disabled={scraping || selectedCount === 0}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {scraping ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowDownTrayIcon className="h-4 w-4" />
                )}
                {scraping ? '抓取中...' : `抓取選中 (${selectedCount})`}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scraping Progress Panel */}
      {scraping && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          {/* Progress Header */}
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600" />
                <span className="font-medium text-zinc-900">抓取進度</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-zinc-600">
                  進度: <span className="font-medium">{scrapeStats.current}/{scrapeStats.total}</span>
                </span>
                <span className="text-green-600">
                  成功: <span className="font-medium">{scrapeStats.success}</span>
                </span>
                <span className="text-red-600">
                  失敗: <span className="font-medium">{scrapeStats.failed}</span>
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-2 h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${scrapeStats.total > 0 ? (scrapeStats.current / scrapeStats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
          
          {/* Progress Logs */}
          <div className="max-h-80 overflow-y-auto p-4">
            <div className="space-y-2 font-mono text-sm">
              {progressLogs.map((log) => (
                <div 
                  key={log.id}
                  className={`flex items-start gap-2 ${
                    log.type === 'item_success' ? 'text-green-700' :
                    log.type === 'item_failed' ? 'text-red-600' :
                    log.type === 'error' ? 'text-red-700 font-medium' :
                    log.type === 'complete' ? 'text-blue-700 font-medium' :
                    log.type === 'start' ? 'text-blue-600' :
                    'text-zinc-600'
                  }`}
                >
                  <span className="text-zinc-400 text-xs whitespace-nowrap">
                    {log.timestamp.toLocaleTimeString('zh-TW', { hour12: false })}
                  </span>
                  <span className="flex-1">{log.message}</span>
                </div>
              ))}
              {progressLogs.length === 0 && (
                <div className="text-zinc-400">等待開始...</div>
              )}
            </div>
          </div>
          
          {/* Current Status */}
          <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-2">
            <div className="text-sm text-zinc-600">{scrapingProgress}</div>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !scraping && (
        <>
          {/* Stats & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600">
                共 <span className="font-semibold">{results.length}</span> 個結果，
                已選 <span className="font-semibold text-green-600">{selectedCount}</span> 個
              </span>
              
              <div className="flex gap-1">
                <button
                  onClick={selectAll}
                  className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
                >
                  全選
                </button>
                <button
                  onClick={deselectAll}
                  className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
                >
                  取消全選
                </button>
                <button
                  onClick={() => selectByScore(60)}
                  className="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50"
                >
                  選高分 (≥60)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-zinc-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="rounded-lg border border-zinc-300 px-3 py-1 text-sm"
              >
                <option value="all">全部</option>
                <option value="high">高分 (≥70)</option>
                <option value="medium">中等 (50-69)</option>
                <option value="low">低分 (&lt;50)</option>
              </select>
            </div>
          </div>

          {/* Result List */}
          <div className="space-y-3">
            {filteredResults.map((result) => (
              <SearchResultCard
                key={result.id}
                result={result}
                onToggle={() => toggleSelect(result.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {results.length === 0 && !searching && (
        <div className="rounded-xl border-2 border-dashed border-zinc-200 p-12 text-center">
          <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-zinc-300" />
          <h3 className="mt-4 font-semibold text-zinc-900">尚未搜尋</h3>
          <p className="mt-2 text-sm text-zinc-500">
            點擊「開始搜尋」按鈕來搜尋與主題相關的來源
          </p>
        </div>
      )}
    </div>
  );
}

// 搜尋結果卡片
function SearchResultCard({ 
  result, 
  onToggle 
}: { 
  result: SearchResult;
  onToggle: () => void;
}) {
  const typeConfig = sourceTypeLabels[result.sourceType] || sourceTypeLabels['OTHER'];
  
  const scoreColor = result.estimatedScore >= 70 
    ? 'text-green-600 bg-green-50' 
    : result.estimatedScore >= 50 
      ? 'text-yellow-600 bg-yellow-50'
      : 'text-red-500 bg-red-50';

  return (
    <div 
      className={`rounded-xl border p-4 transition-all cursor-pointer ${
        result.selected 
          ? 'border-green-300 bg-green-50/50' 
          : 'border-zinc-200 bg-white hover:border-zinc-300'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
          result.selected 
            ? 'border-green-500 bg-green-500' 
            : 'border-zinc-300'
        }`}>
          {result.selected && <CheckIcon className="h-3 w-3 text-white" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-zinc-900 line-clamp-1">
                {result.title}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                <GlobeAltIcon className="h-3 w-3" />
                <span className="truncate">{result.domain}</span>
                <span className={`rounded-full px-2 py-0.5 ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
              </div>
            </div>

            {/* Score */}
            <div className={`flex items-center gap-1 rounded-full px-2 py-1 ${scoreColor}`}>
              <StarIcon className="h-4 w-4" />
              <span className="font-semibold">{result.estimatedScore}</span>
            </div>
          </div>

          {/* Snippet */}
          <p className="mt-2 text-sm text-zinc-600 line-clamp-2">
            {result.snippet}
          </p>

          {/* URL */}
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <LinkIcon className="h-3 w-3" />
            {result.url.length > 60 ? result.url.substring(0, 60) + '...' : result.url}
          </a>
        </div>
      </div>
    </div>
  );
}
