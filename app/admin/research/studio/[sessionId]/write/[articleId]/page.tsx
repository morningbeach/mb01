'use client';

// app/admin/research/studio/[sessionId]/write/[articleId]/page.tsx
// 文章編輯頁面 - 編輯已生成的文章

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckIcon,
  PencilSquareIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Article {
  id: string;
  title_zh: string;
  title_en?: string;
  content_zh: string;
  content_en?: string;
  metaDescription_zh?: string;
  metaDescription_en?: string;
  status: string;
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'bg-zinc-100 text-zinc-800' },
  READY: { label: '待發布', color: 'bg-blue-100 text-blue-800' },
  PUBLISHED: { label: '已發布', color: 'bg-green-100 text-green-800' },
  ARCHIVED: { label: '已封存', color: 'bg-orange-100 text-orange-800' },
};

export default function ArticleEditPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const articleId = params.articleId as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  // 編輯表單
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/research/v2/articles/${articleId}`);
      const data = await res.json();
      
      // API 返回 draft 而不是 article
      const articleData = data.draft || data.article;
      
      if (articleData) {
        setArticle(articleData);
        setTitle(articleData.title_zh || '');
        setContent(articleData.content_zh || '');
        setMetaDescription(articleData.excerpt_zh || articleData.metaDescription_zh || '');
      } else {
        setError('找不到文章');
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('載入文章失敗');
    } finally {
      setLoading(false);
    }
  };

  const saveArticle = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/research/v2/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_zh: title,
          content_zh: content,
          excerpt_zh: metaDescription
        })
      });
      
      const data = await res.json();
      if (data.draft) {
        setArticle(data.draft);
        alert('已儲存');
      } else {
        alert('儲存失敗: ' + (data.error || '未知錯誤'));
      }
    } catch (err) {
      alert('儲存錯誤');
    } finally {
      setSaving(false);
    }
  };

  const publishArticle = async () => {
    if (!confirm('確定要發布此文章嗎？')) return;
    
    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/research/v2/articles/${articleId}/publish`, {
        method: 'POST'
      });
      
      const data = await res.json();
      if (data.success) {
        alert('發布成功！');
        router.push(`/admin/research/studio/${sessionId}`);
      } else {
        alert('發布失敗: ' + data.error);
      }
    } catch (err) {
      alert('發布錯誤');
    } finally {
      setPublishing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      alert('已複製到剪貼簿');
    } catch (err) {
      alert('複製失敗');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="space-y-6">
        <Link 
          href={`/admin/research/studio/${sessionId}`}
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          返回研究
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-800">{error || '找不到文章'}</p>
        </div>
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
          <h1 className="text-2xl font-bold text-zinc-900">編輯文章</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs ${statusLabels[article.status]?.color || 'bg-zinc-100'}`}>
              {statusLabels[article.status]?.label || article.status}
            </span>
            <span className="text-sm text-zinc-500">
              上次更新: {new Date(article.updatedAt).toLocaleString('zh-TW')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex rounded-lg border border-zinc-200 p-1">
            <button
              onClick={() => setMode('edit')}
              className={`rounded-md px-3 py-1.5 text-sm ${
                mode === 'edit' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <PencilSquareIcon className="mr-1 inline h-4 w-4" />
              編輯
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`rounded-md px-3 py-1.5 text-sm ${
                mode === 'preview' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <EyeIcon className="mr-1 inline h-4 w-4" />
              預覽
            </button>
          </div>

          <button
            onClick={copyToClipboard}
            className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50"
            title="複製內容"
          >
            <ClipboardDocumentIcon className="h-5 w-5 text-zinc-600" />
          </button>

          <button
            onClick={saveArticle}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 hover:bg-zinc-50 disabled:opacity-50"
          >
            {saving ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <CheckIcon className="h-4 w-4" />
            )}
            儲存
          </button>

          <button
            onClick={publishArticle}
            disabled={publishing}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {publishing ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpTrayIcon className="h-4 w-4" />
            )}
            發布
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        {mode === 'edit' ? (
          <div className="space-y-4 p-6">
            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                文章標題
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-lg font-semibold focus:border-zinc-900 focus:outline-none"
                placeholder="輸入文章標題..."
              />
            </div>

            {/* Meta Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Meta Description (SEO 描述)
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-900 focus:outline-none"
                placeholder="輸入 SEO 描述..."
              />
              <p className="mt-1 text-xs text-zinc-500">
                {metaDescription.length}/160 字元
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                文章內容 (Markdown)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={25}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 font-mono text-sm focus:border-zinc-900 focus:outline-none"
                placeholder="輸入文章內容..."
              />
              <p className="mt-1 text-xs text-zinc-500">
                約 {content.length} 字元
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <article className="prose prose-zinc max-w-none">
              <h1>{title}</h1>
              {metaDescription && (
                <p className="lead text-zinc-600">{metaDescription}</p>
              )}
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: content
                    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br />')
                }}
              />
            </article>
          </div>
        )}
      </div>

      {/* Word Count */}
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          <DocumentTextIcon className="mr-1 inline h-4 w-4" />
          約 {Math.ceil(content.length / 2)} 字
        </span>
        <span>
          文章 ID: {articleId}
        </span>
      </div>
    </div>
  );
}
