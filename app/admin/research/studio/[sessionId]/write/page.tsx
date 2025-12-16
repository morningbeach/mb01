'use client';

// app/admin/research/studio/[sessionId]/write/page.tsx
// 文章生成與編輯介面

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  SparklesIcon,
  DocumentTextIcon,
  CheckIcon,
  PencilSquareIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  ArrowUpTrayIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface Module {
  id: string;
  moduleType: string;
  title_zh: string;
  conclusion_zh: string;
  insight_zh?: string;
  humanApproved: boolean;
}

interface TitleSuggestion {
  title: string;
  angle: string;
  hook: string;
}

interface ArticleOutline {
  title: string;
  sections: {
    heading: string;
    keyPoints: string[];
    moduleIds: string[];
  }[];
}

interface GeneratedArticle {
  id: string;
  title_zh: string;
  content_zh: string;
  metaDescription_zh?: string;
  status: string;
}

const ARTICLE_STYLES = [
  { id: 'dawnbags', label: 'DawnBags 風格', desc: '友善對話、實用導向' },
  { id: 'mbpack', label: 'MB Pack 風格', desc: '專業分析、深度洞察' },
];

const ARTICLE_TYPES = [
  { id: 'trend', label: '趨勢分析', desc: '市場動態與產業趨勢' },
  { id: 'guide', label: '實用指南', desc: '如何選擇、材質介紹' },
  { id: 'material', label: '材質深度', desc: '材料特性與比較' },
  { id: 'case_study', label: '案例研究', desc: '成功案例與應用' },
];

export default function WriteArticlePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  // State
  const [step, setStep] = useState<'select' | 'titles' | 'outline' | 'generate' | 'edit'>('select');
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [articleStyle, setArticleStyle] = useState('mbpack');
  const [articleType, setArticleType] = useState('trend');
  const [customAngle, setCustomAngle] = useState('');
  
  const [titleSuggestions, setTitleSuggestions] = useState<TitleSuggestion[]>([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [outline, setOutline] = useState<ArticleOutline | null>(null);
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchModules();
  }, [sessionId]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/research/v2/sessions/${sessionId}`);
      const data = await res.json();
      setModules(data.session?.modules || []);
      // Pre-select approved modules
      const approved = (data.session?.modules || [])
        .filter((m: Module) => m.humanApproved)
        .map((m: Module) => m.id);
      setSelectedModules(approved.length > 0 ? approved : []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTitles = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/research/v2/articles/titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          moduleIds: selectedModules,
          articleType,
          style: articleStyle,
          customAngle: customAngle || undefined
        })
      });
      const data = await res.json();
      setTitleSuggestions(data.titles || []);
      setStep('titles');
    } catch (error) {
      console.error('Error fetching titles:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateOutline = async () => {
    if (!selectedTitle) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/research/v2/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          moduleIds: selectedModules,
          title: selectedTitle,
          articleType,
          style: articleStyle,
          action: 'outline'
        })
      });
      const data = await res.json();
      setOutline(data.outline);
      setStep('outline');
    } catch (error) {
      console.error('Error generating outline:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateArticle = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/research/v2/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          moduleIds: selectedModules,
          title: selectedTitle,
          outline,
          articleType,
          style: articleStyle,
          action: 'generate',
          language: 'zh'
        })
      });
      const data = await res.json();
      setArticle(data.article);
      setStep('edit');
    } catch (error) {
      console.error('Error generating article:', error);
    } finally {
      setGenerating(false);
    }
  };

  const publishArticle = async () => {
    if (!article) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/research/v2/articles/${article.id}/publish`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/admin/blog/${data.blogPostId}`);
      }
    } catch (error) {
      console.error('Error publishing:', error);
    } finally {
      setPublishing(false);
    }
  };

  const copyToClipboard = () => {
    if (article) {
      navigator.clipboard.writeText(article.content_zh);
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
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link 
          href={`/admin/research/studio/${sessionId}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          返回研究
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">生成文章</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[
          { key: 'select', label: '選擇內容' },
          { key: 'titles', label: '標題建議' },
          { key: 'outline', label: '文章大綱' },
          { key: 'edit', label: '編輯發布' },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div
              className={`flex h-8 items-center gap-2 rounded-full px-3 text-sm ${
                step === s.key
                  ? 'bg-zinc-900 text-white'
                  : ['select', 'titles', 'outline', 'edit'].indexOf(step) > i
                  ? 'bg-green-100 text-green-800'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              {['select', 'titles', 'outline', 'edit'].indexOf(step) > i ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <span className="text-xs">{i + 1}</span>
              )}
              {s.label}
            </div>
            {i < 3 && <ChevronRightIcon className="h-4 w-4 text-zinc-300" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 'select' && (
        <SelectContentStep
          modules={modules}
          selectedModules={selectedModules}
          setSelectedModules={setSelectedModules}
          articleStyle={articleStyle}
          setArticleStyle={setArticleStyle}
          articleType={articleType}
          setArticleType={setArticleType}
          customAngle={customAngle}
          setCustomAngle={setCustomAngle}
          onNext={fetchTitles}
          generating={generating}
        />
      )}

      {step === 'titles' && (
        <SelectTitleStep
          titles={titleSuggestions}
          selectedTitle={selectedTitle}
          setSelectedTitle={setSelectedTitle}
          onBack={() => setStep('select')}
          onNext={generateOutline}
          generating={generating}
        />
      )}

      {step === 'outline' && outline && (
        <OutlineStep
          outline={outline}
          onBack={() => setStep('titles')}
          onGenerate={generateArticle}
          generating={generating}
        />
      )}

      {step === 'edit' && article && (
        <EditStep
          article={article}
          setArticle={setArticle}
          onCopy={copyToClipboard}
          onPublish={publishArticle}
          publishing={publishing}
        />
      )}
    </div>
  );
}

// Step 1: Select Content
function SelectContentStep({
  modules,
  selectedModules,
  setSelectedModules,
  articleStyle,
  setArticleStyle,
  articleType,
  setArticleType,
  customAngle,
  setCustomAngle,
  onNext,
  generating
}: {
  modules: Module[];
  selectedModules: string[];
  setSelectedModules: (v: string[]) => void;
  articleStyle: string;
  setArticleStyle: (v: string) => void;
  articleType: string;
  setArticleType: (v: string) => void;
  customAngle: string;
  setCustomAngle: (v: string) => void;
  onNext: () => void;
  generating: boolean;
}) {
  const toggleModule = (id: string) => {
    setSelectedModules(
      selectedModules.includes(id)
        ? selectedModules.filter(m => m !== id)
        : [...selectedModules, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Style Selection */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">寫作風格</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {ARTICLE_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setArticleStyle(style.id)}
              className={`rounded-lg border p-4 text-left transition-all ${
                articleStyle === style.id
                  ? 'border-zinc-900 bg-zinc-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="font-medium">{style.label}</div>
              <div className="text-sm text-zinc-500">{style.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Type Selection */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">文章類型</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {ARTICLE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setArticleType(type.id)}
              className={`rounded-lg border p-4 text-left transition-all ${
                articleType === type.id
                  ? 'border-zinc-900 bg-zinc-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="font-medium">{type.label}</div>
              <div className="text-sm text-zinc-500">{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Angle */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">自訂角度（選填）</h3>
        <input
          type="text"
          value={customAngle}
          onChange={(e) => setCustomAngle(e.target.value)}
          placeholder="例如：聚焦在環保材質的成本效益分析"
          className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      {/* Module Selection */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">選擇研究模組</h3>
          <span className="text-sm text-zinc-500">已選 {selectedModules.length} 個</span>
        </div>
        {modules.length === 0 ? (
          <p className="text-zinc-500">無可用模組</p>
        ) : (
          <div className="space-y-2">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                  selectedModules.includes(module.id)
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  selectedModules.includes(module.id)
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-300'
                }`}>
                  {selectedModules.includes(module.id) && <CheckIcon className="h-3 w-3" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{module.title_zh}</span>
                    {module.humanApproved && (
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">已核准</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{module.conclusion_zh}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={selectedModules.length === 0 || generating}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {generating ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              生成標題中...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              生成標題建議
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Step 2: Select Title
function SelectTitleStep({
  titles,
  selectedTitle,
  setSelectedTitle,
  onBack,
  onNext,
  generating
}: {
  titles: TitleSuggestion[];
  selectedTitle: string;
  setSelectedTitle: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
  generating: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">選擇標題</h3>
        
        {titles.length === 0 ? (
          <p className="text-zinc-500">無標題建議</p>
        ) : (
          <div className="space-y-3">
            {titles.map((t, i) => (
              <button
                key={i}
                onClick={() => setSelectedTitle(t.title)}
                className={`w-full rounded-lg border p-4 text-left transition-all ${
                  selectedTitle === t.title
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="font-medium">{t.title}</div>
                <div className="mt-1 text-sm text-zinc-500">{t.angle}</div>
                <div className="mt-2 text-xs text-zinc-400">開場: {t.hook}</div>
              </button>
            ))}
          </div>
        )}

        {/* Custom Title */}
        <div className="mt-6">
          <label className="mb-2 block text-sm text-zinc-600">或輸入自訂標題</label>
          <input
            type="text"
            value={selectedTitle}
            onChange={(e) => setSelectedTitle(e.target.value)}
            placeholder="輸入你的標題..."
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border border-zinc-300 px-6 py-2.5 hover:bg-zinc-50"
        >
          上一步
        </button>
        <button
          onClick={onNext}
          disabled={!selectedTitle || generating}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {generating ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              生成大綱中...
            </>
          ) : (
            <>生成大綱</>
          )}
        </button>
      </div>
    </div>
  );
}

// Step 3: Outline
function OutlineStep({
  outline,
  onBack,
  onGenerate,
  generating
}: {
  outline: ArticleOutline;
  onBack: () => void;
  onGenerate: () => void;
  generating: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h3 className="mb-2 text-lg font-semibold">{outline.title}</h3>
        
        <div className="mt-6 space-y-4">
          {outline.sections.map((section, i) => (
            <div key={i} className="rounded-lg bg-zinc-50 p-4">
              <h4 className="font-medium text-zinc-900">{i + 1}. {section.heading}</h4>
              <ul className="mt-2 space-y-1">
                {section.keyPoints.map((point, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-zinc-600">
                    <span className="text-zinc-400">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border border-zinc-300 px-6 py-2.5 hover:bg-zinc-50"
        >
          上一步
        </button>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {generating ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              生成文章中...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              生成完整文章
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Step 4: Edit
function EditStep({
  article,
  setArticle,
  onCopy,
  onPublish,
  publishing
}: {
  article: GeneratedArticle;
  setArticle: (a: GeneratedArticle) => void;
  onCopy: () => void;
  onPublish: () => void;
  publishing: boolean;
}) {
  const [view, setView] = useState<'edit' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setView('preview')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
              view === 'preview' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            <EyeIcon className="h-4 w-4" />
            預覽
          </button>
          <button
            onClick={() => setView('edit')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
              view === 'edit' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            <PencilSquareIcon className="h-4 w-4" />
            編輯
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            {copied ? '已複製' : '複製'}
          </button>
          <button
            onClick={onPublish}
            disabled={publishing}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          >
            {publishing ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                發布中...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="h-4 w-4" />
                發布到部落格
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <input
          type="text"
          value={article.title_zh}
          onChange={(e) => setArticle({ ...article, title_zh: e.target.value })}
          className="mb-4 w-full border-b border-zinc-200 pb-2 text-2xl font-bold focus:border-zinc-400 focus:outline-none"
        />

        {view === 'preview' ? (
          <div 
            className="prose prose-zinc max-w-none"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(article.content_zh) }}
          />
        ) : (
          <textarea
            value={article.content_zh}
            onChange={(e) => setArticle({ ...article, content_zh: e.target.value })}
            rows={30}
            className="w-full resize-none rounded-lg border border-zinc-200 p-4 font-mono text-sm focus:border-zinc-400 focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}

// Simple markdown to HTML converter
function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/\n/g, '<br />');
}
