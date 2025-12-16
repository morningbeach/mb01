'use client';

// app/admin/research/studio/[sessionId]/enhanced-article/page.tsx
// 增強版文章生成頁面 - 視覺化、嚴格引用、自動配圖

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ResearchModule {
  id: string;
  moduleType: string;
  title_zh: string;
  conclusion_zh: string;
  tags: string[];
}

interface ArticleCitation {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  authorityScore: number;
  quotedText: string;
  context: string;
  position: number;
}

interface ArticleVisualization {
  id: string;
  type: string;
  title: string;
  data: any;
  position: string;
  caption?: string;
}

interface ArticleImage {
  id: string;
  prompt: string;
  position: string;
  alt: string;
  caption?: string;
  suggestedQuery?: string;
  type: string;
}

interface GenerationResult {
  draft: {
    id: string;
    title_zh: string;
    excerpt_zh: string;
    wordCount: number;
  };
  article: {
    citations: ArticleCitation[];
    visualizations: ArticleVisualization[];
    images: ArticleImage[];
    referenceSection: string;
    tags: string[];
  };
  stats: {
    citations: number;
    visualizations: number;
    images: number;
    wordCount: number;
    uniqueSources: number;
  };
}

export default function EnhancedArticlePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  // 狀態
  const [modules, setModules] = useState<ResearchModule[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 生成選項
  const [options, setOptions] = useState({
    articleType: 'trend' as 'trend' | 'guide' | 'case-study' | 'material' | 'comparison',
    title: '',
    enableVisualization: true,
    enableStrictCitations: true,
    enableAutoImages: true,
    imageStyle: 'professional' as 'professional' | 'creative' | 'minimal',
    citationStyle: 'inline' as 'inline' | 'footnote' | 'endnote'
  });

  // 載入模組
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await fetch(`/api/admin/research/v2/sessions/${sessionId}/modules`);
        if (!res.ok) throw new Error('載入模組失敗');
        const data = await res.json();
        setModules(data.modules || []);
        // 預設選擇所有模組
        setSelectedModules((data.modules || []).map((m: ResearchModule) => m.id));
      } catch (err) {
        console.error(err);
        setError('載入研究模組失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [sessionId]);

  // 生成文章
  const handleGenerate = async () => {
    if (selectedModules.length === 0) {
      setError('請至少選擇一個研究模組');
      return;
    }

    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/admin/research/v2/sessions/${sessionId}/enhanced-article`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleIds: selectedModules,
          ...options
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '生成失敗');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成文章時發生錯誤');
    } finally {
      setGenerating(false);
    }
  };

  // 模組類型標籤
  const getModuleTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      TREND: 'bg-blue-100 text-blue-800',
      MATERIAL: 'bg-green-100 text-green-800',
      CASE_STUDY: 'bg-purple-100 text-purple-800',
      MARKET_INSIGHT: 'bg-orange-100 text-orange-800',
      TECHNOLOGY: 'bg-cyan-100 text-cyan-800',
      COMPARISON: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/research/studio/${sessionId}`}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 返回研究室
              </Link>
              <h1 className="text-xl font-bold text-gray-900">✨ 增強版文章生成</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：設定面板 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 功能說明 */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <h2 className="text-lg font-bold mb-3">🚀 增強功能</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-yellow-300">📊</span>
                  研究視覺化 - 自動生成圖表建議
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-300">📝</span>
                  嚴格引用 - 每個論點標註來源
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-300">🖼️</span>
                  自動配圖 - AI 生成圖片建議
                </li>
              </ul>
            </div>

            {/* 生成選項 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">生成選項</h3>
              
              {/* 文章標題 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文章標題（可選）
                </label>
                <input
                  type="text"
                  value={options.title}
                  onChange={(e) => setOptions({ ...options, title: e.target.value })}
                  placeholder="留空將自動生成"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              {/* 文章類型 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文章類型
                </label>
                <select
                  value={options.articleType}
                  onChange={(e) => setOptions({ ...options, articleType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="trend">趨勢分析</option>
                  <option value="guide">實用指南</option>
                  <option value="case-study">案例研究</option>
                  <option value="material">材料介紹</option>
                  <option value="comparison">產品比較</option>
                </select>
              </div>

              {/* 增強功能開關 */}
              <div className="space-y-3 mb-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={options.enableVisualization}
                    onChange={(e) => setOptions({ ...options, enableVisualization: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">📊 研究視覺化</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={options.enableStrictCitations}
                    onChange={(e) => setOptions({ ...options, enableStrictCitations: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">📝 嚴格引用</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={options.enableAutoImages}
                    onChange={(e) => setOptions({ ...options, enableAutoImages: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">🖼️ 自動配圖建議</span>
                </label>
              </div>

              {/* 圖片風格 */}
              {options.enableAutoImages && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    圖片風格
                  </label>
                  <select
                    value={options.imageStyle}
                    onChange={(e) => setOptions({ ...options, imageStyle: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="professional">專業風格</option>
                    <option value="creative">創意風格</option>
                    <option value="minimal">簡約風格</option>
                  </select>
                </div>
              )}
            </div>

            {/* 模組選擇 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">選擇研究模組</h3>
                <button
                  onClick={() => setSelectedModules(
                    selectedModules.length === modules.length ? [] : modules.map(m => m.id)
                  )}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedModules.length === modules.length ? '取消全選' : '全選'}
                </button>
              </div>
              
              {modules.length === 0 ? (
                <p className="text-sm text-gray-500">尚無研究模組，請先生成模組</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {modules.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedModules.includes(m.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedModules.includes(m.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModules([...selectedModules, m.id]);
                          } else {
                            setSelectedModules(selectedModules.filter(id => id !== m.id));
                          }
                        }}
                        className="mt-1 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${getModuleTypeBadge(m.moduleType)}`}>
                            {m.moduleType}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {m.title_zh}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {m.conclusion_zh}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 生成按鈕 */}
            <button
              onClick={handleGenerate}
              disabled={generating || selectedModules.length === 0}
              className={`w-full py-4 rounded-lg font-bold text-white transition-colors ${
                generating || selectedModules.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  生成中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>✨</span>
                  生成增強版文章
                </span>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* 右側：結果顯示 */}
          <div className="lg:col-span-2">
            {!result ? (
              <div className="bg-white rounded-lg p-12 shadow-sm text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  準備生成增強版文章
                </h3>
                <p className="text-gray-500 text-sm">
                  選擇研究模組並設定選項後，點擊生成按鈕開始
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 生成統計 */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">📊 生成統計</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{result.stats.wordCount}</div>
                      <div className="text-sm text-gray-600">字數</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{result.stats.citations}</div>
                      <div className="text-sm text-gray-600">引用次數</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{result.stats.uniqueSources}</div>
                      <div className="text-sm text-gray-600">來源數</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{result.stats.visualizations}</div>
                      <div className="text-sm text-gray-600">視覺化</div>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <div className="text-2xl font-bold text-pink-600">{result.stats.images}</div>
                      <div className="text-sm text-gray-600">配圖建議</div>
                    </div>
                  </div>
                </div>

                {/* 文章預覽 */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">📄 文章預覽</h3>
                    <Link
                      href={`/admin/research/studio/${sessionId}/articles/${result.draft.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      查看完整文章 →
                    </Link>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{result.draft.title_zh}</h4>
                    <p className="text-gray-600">{result.draft.excerpt_zh}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {result.article.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 引用列表 */}
                {result.article.citations.length > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">📝 引用來源 ({result.article.citations.length})</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {result.article.citations.map((citation, i) => (
                        <div key={citation.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <a
                                href={citation.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-blue-600 hover:underline truncate"
                              >
                                {citation.sourceTitle}
                              </a>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                citation.authorityScore >= 80 ? 'bg-green-100 text-green-800' :
                                citation.authorityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {citation.authorityScore}分
                              </span>
                            </div>
                            {citation.quotedText && (
                              <p className="text-xs text-gray-500 mt-1 italic">
                                "{citation.quotedText.slice(0, 100)}..."
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 視覺化建議 */}
                {result.article.visualizations.length > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">📊 視覺化建議 ({result.article.visualizations.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.article.visualizations.map((viz) => (
                        <div key={viz.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">
                              {viz.type === 'bar-chart' ? '📊' :
                               viz.type === 'pie-chart' ? '🥧' :
                               viz.type === 'timeline' ? '📅' :
                               viz.type === 'comparison-table' ? '📋' :
                               viz.type === 'flow-chart' ? '🔀' : '📈'}
                            </span>
                            <span className="font-medium text-gray-900">{viz.title}</span>
                          </div>
                          <p className="text-sm text-gray-500">類型: {viz.type}</p>
                          {viz.caption && (
                            <p className="text-xs text-gray-400 mt-1">{viz.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 配圖建議 */}
                {result.article.images.length > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">🖼️ 配圖建議 ({result.article.images.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.article.images.map((img) => (
                        <div key={img.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{img.alt}</span>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              img.position === 'cover' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {img.position === 'cover' ? '封面' : img.position}
                            </span>
                          </div>
                          <div className="bg-gray-100 rounded p-2 mb-2">
                            <p className="text-xs text-gray-600 font-mono">
                              {img.prompt.slice(0, 150)}...
                            </p>
                          </div>
                          {img.suggestedQuery && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500">搜尋建議:</span>
                              <a
                                href={`https://unsplash.com/s/photos/${encodeURIComponent(img.suggestedQuery)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {img.suggestedQuery}
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 操作按鈕 */}
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push(`/admin/research/studio/${sessionId}/articles/${result.draft.id}/edit`)}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    編輯文章
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    重新生成
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
