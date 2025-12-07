'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, Loader2, Users, Calendar, TrendingUp, 
  ExternalLink, Mail, RefreshCw
} from 'lucide-react';

interface UsageStats {
  totalUsage: number;
  todayUsage: number;
  uniqueIPCount: number;
  usageByDate: Array<{ date: string; count: number }>;
  topProducts: Array<{ slug: string; count: number }>;
}

interface RecentLog {
  id: string;
  ip: string;
  product: string | null;
  productSlug: string | null;
  prompt: string | null;
  resultUrl: string | null;
  shareToken: string | null;
  createdAt: string;
}

interface Inquiry {
  id: string;
  email: string;
  ip: string;
  message: string | null;
  createdAt: string;
}

export default function AiUsagePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [days, setDays] = useState(7);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ai-usage?days=${days}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentLogs(data.recentLogs);
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error('載入失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 標題列 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">AI 使用統計</h1>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg"
            >
              <option value={7}>過去 7 天</option>
              <option value={30}>過去 30 天</option>
              <option value={90}>過去 90 天</option>
            </select>
            <button
              onClick={loadData}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <Link 
              href="/admin/ai-prompts" 
              className="text-blue-600 hover:text-blue-800"
            >
              管理範本 →
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : stats && (
          <>
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-500">總使用次數</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.totalUsage.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-500">今日使用</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.todayUsage.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-500">不重複訪客</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.uniqueIPCount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* 熱門產品 */}
            {stats.topProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">熱門產品</h2>
                <div className="flex flex-wrap gap-2">
                  {stats.topProducts.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/products/${product.slug}`}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-2"
                    >
                      {product.slug}
                      <span className="text-gray-500">({product.count})</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 最近使用記錄 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4">最近使用記錄</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {log.resultUrl && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                          <Image
                            src={log.resultUrl}
                            alt=""
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">
                            {log.product || log.productSlug || '未知產品'}
                          </span>
                          {log.shareToken && (
                            <Link
                              href={`/ai-share/${log.shareToken}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {log.prompt || '無提示詞'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span>{log.ip}</span>
                          <span>•</span>
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentLogs.length === 0 && (
                    <p className="text-gray-500 text-center py-4">暫無記錄</p>
                  )}
                </div>
              </div>

              {/* 詢價記錄 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  詢價記錄
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {inq.email}
                        </span>
                      </div>
                      {inq.message && (
                        <p className="text-sm text-gray-600 mb-1">
                          {inq.message}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{inq.ip}</span>
                        <span>•</span>
                        <span>{formatDate(inq.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                  {inquiries.length === 0 && (
                    <p className="text-gray-500 text-center py-4">暫無詢價</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
