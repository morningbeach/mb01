'use client';

// app/admin/research/studio/[sessionId]/deep-research/page.tsx
// 深度研究頁面 - AI 迭代優化搜尋

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface ProgressLog {
  id: number;
  type: string;
  message: string;
  timestamp: Date;
  data?: any;
}

interface ResearchGoal {
  minQualitySources: number;
  minTotalWords: number;
  minAuthorityScore: number;
  maxIterations: number;
}

interface Stats {
  totalSources: number;
  qualitySources: number;
  totalWords?: number;
  avgAuthority: number;
  iterations?: number;
}

export default function DeepResearchPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  
  // 目標設定
  const [goal, setGoal] = useState<ResearchGoal>({
    minQualitySources: 15,
    minTotalWords: 50000,
    minAuthorityScore: 60,
    maxIterations: 5
  });

  // 進度
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [currentStats, setCurrentStats] = useState<Stats | null>(null);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

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

  let logIdCounter = 0;
  const addLog = (type: string, message: string, data?: any) => {
    setLogs(prev => [...prev, {
      id: logIdCounter++,
      type,
      message,
      timestamp: new Date(),
      data
    }]);
  };

  const startDeepResearch = async () => {
    setRunning(true);
    setShowConfig(false);
    setLogs([]);
    setCompleted(false);
    setError(null);
    setCurrentIteration(0);
    setCurrentStats(null);

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(`/api/admin/research/v2/sessions/${sessionId}/deep-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
        signal: abortControllerRef.current.signal
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
              handleStreamEvent(data);
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || '深度研究失敗');
        addLog('error', '錯誤: ' + err.message);
      }
    } finally {
      setRunning(false);
    }
  };

  const handleStreamEvent = (data: any) => {
    switch (data.type) {
      case 'start':
        addLog('start', data.message, data);
        break;
        
      case 'iteration_start':
        setCurrentIteration(data.iteration);
        addLog('iteration', data.message);
        break;

      case 'generating_keywords':
      case 'searching':
      case 'scraping':
      case 'analyzing':
        addLog('progress', data.message, data);
        break;

      case 'keywords_generated':
        addLog('keywords', `🔑 新關鍵字: ${data.keywords.join(', ')}`, data);
        break;

      case 'search_complete':
        addLog('search', data.message);
        break;

      case 'source_added':
        addLog('success', data.message, data);
        break;

      case 'scrape_failed':
      case 'source_error':
      case 'search_error':
        addLog('warning', data.message || data.error, data);
        break;

      case 'iteration_complete':
        addLog('iteration_done', `✓ ${data.message}`);
        break;

      case 'progress_check':
        setCurrentStats(data.stats);
        addLog('stats', data.message, data);
        break;

      case 'goal_reached':
        addLog('goal', `🎉 ${data.message}`, data);
        break;

      case 'complete':
        setCompleted(true);
        setCurrentStats(data.stats);
        addLog('complete', data.message, data);
        break;

      case 'error':
        setError(data.message);
        addLog('error', data.message);
        break;

      case 'no_new_sources':
        addLog('warning', data.message);
        break;
    }
  };

  const stopResearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      addLog('warning', '使用者中止研究');
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-orange-500';
      case 'iteration': return 'text-blue-600 font-semibold';
      case 'iteration_done': return 'text-blue-700';
      case 'keywords': return 'text-purple-600';
      case 'goal': return 'text-green-700 font-semibold';
      case 'complete': return 'text-blue-700 font-semibold';
      case 'stats': return 'text-cyan-600';
      default: return 'text-zinc-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const qualitySources = session?.sources?.filter((s: any) => 
    !s.isExcluded && s.authorityScore >= goal.minAuthorityScore
  ).length || 0;

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
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
            深度研究
          </h1>
          <p className="mt-1 text-zinc-500">
            AI 智能迭代搜尋，自動擴展研究來源
          </p>
        </div>

        {!running && !completed && (
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
          >
            <Cog6ToothIcon className="h-4 w-4" />
            設定目標
          </button>
        )}
      </div>

      {/* Current Status Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-zinc-900">主題: {session?.topic || '未命名'}</h3>
            <p className="text-sm text-zinc-500">
              目前來源: {session?.sources?.filter((s: any) => !s.isExcluded).length || 0} 個，
              高品質: {qualitySources} 個
            </p>
          </div>
          {currentStats && (
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentStats.totalSources}</div>
                <div className="text-xs text-zinc-500">總來源</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentStats.qualitySources}</div>
                <div className="text-xs text-zinc-500">高品質</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{currentStats.avgAuthority}</div>
                <div className="text-xs text-zinc-500">平均權威</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && !running && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Cog6ToothIcon className="h-5 w-5 text-zinc-400" />
            研究目標設定
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                最少高品質來源數
              </label>
              <input
                type="number"
                value={goal.minQualitySources}
                onChange={(e) => setGoal({ ...goal, minQualitySources: parseInt(e.target.value) || 10 })}
                min={5}
                max={50}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2"
              />
              <p className="mt-1 text-xs text-zinc-500">
                權威分數 ≥ {goal.minAuthorityScore} 的來源
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                最低權威分數門檻
              </label>
              <input
                type="number"
                value={goal.minAuthorityScore}
                onChange={(e) => setGoal({ ...goal, minAuthorityScore: parseInt(e.target.value) || 60 })}
                min={40}
                max={90}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2"
              />
              <p className="mt-1 text-xs text-zinc-500">
                低於此分數的來源不計入高品質
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                最大迭代次數
              </label>
              <input
                type="number"
                value={goal.maxIterations}
                onChange={(e) => setGoal({ ...goal, maxIterations: Math.min(parseInt(e.target.value) || 5, 10) })}
                min={1}
                max={10}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2"
              />
              <p className="mt-1 text-xs text-zinc-500">
                每輪迭代會 AI 生成新關鍵字搜尋
              </p>
            </div>

            <div className="flex items-end">
              <button
                onClick={startDeepResearch}
                disabled={running}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                <PlayIcon className="h-5 w-5" />
                開始深度研究
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-purple-50 p-4">
            <h4 className="font-medium text-purple-900 mb-2">🧠 AI 迭代研究原理</h4>
            <ol className="text-sm text-purple-800 space-y-1">
              <li>1. 分析現有來源內容，找出尚未涵蓋的角度</li>
              <li>2. AI 生成優化後的搜尋關鍵字</li>
              <li>3. 自動搜尋、抓取、分析新來源</li>
              <li>4. 重複直到達成目標或達到最大迭代次數</li>
            </ol>
          </div>
        </div>
      )}

      {/* Progress Panel */}
      {(running || logs.length > 0) && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {running ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin text-purple-600" />
                ) : completed ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                ) : error ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                ) : (
                  <DocumentTextIcon className="h-5 w-5 text-zinc-400" />
                )}
                <span className="font-medium text-zinc-900">
                  {running ? `第 ${currentIteration} 輪迭代中...` : 
                   completed ? '研究完成' : 
                   error ? '發生錯誤' : '研究日誌'}
                </span>
              </div>
              
              {running && (
                <button
                  onClick={stopResearch}
                  className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
                >
                  <StopIcon className="h-4 w-4" />
                  停止
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {running && goal.maxIterations > 0 && (
              <div className="mt-2 h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
                <div 
                  className="h-full bg-purple-600 transition-all duration-500"
                  style={{ width: `${(currentIteration / goal.maxIterations) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Logs */}
          <div className="max-h-96 overflow-y-auto p-4">
            <div className="space-y-1 font-mono text-sm">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className={`flex items-start gap-2 ${getLogColor(log.type)}`}
                >
                  <span className="text-zinc-400 text-xs whitespace-nowrap">
                    {log.timestamp.toLocaleTimeString('zh-TW', { hour12: false })}
                  </span>
                  <span className="flex-1">{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Completion Actions */}
      {completed && (
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/admin/research/studio/${sessionId}`)}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800"
          >
            <DocumentTextIcon className="h-5 w-5" />
            查看研究結果
          </button>
          <button
            onClick={() => {
              setShowConfig(true);
              setCompleted(false);
              setLogs([]);
            }}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
          >
            <ArrowPathIcon className="h-5 w-5" />
            繼續研究
          </button>
        </div>
      )}
    </div>
  );
}
