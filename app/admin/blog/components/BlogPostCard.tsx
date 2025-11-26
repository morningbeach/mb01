"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface BlogPostCardProps {
  post: any;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`確定要刪除文章「${post.title}」嗎？\n此操作無法復原！`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/blog/${post.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "刪除失敗");
      }

      router.refresh();
    } catch (error: any) {
      alert(`刪除失敗: ${error.message}`);
      setDeleting(false);
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "未設定";
    return new Date(date).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="group relative flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md">
      {/* 封面圖 */}
      <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* 內容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link
              href={`/admin/blog/${post.id}/edit`}
              className="block text-lg font-semibold text-zinc-900 hover:text-blue-600 truncate"
            >
              {post.title}
            </Link>
            <p className="mt-1 text-sm text-zinc-600 line-clamp-2">
              {post.excerpt || post.content?.substring(0, 100)}
            </p>
          </div>

          {/* 狀態標籤 */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {post.isFeatured && (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                精選
              </span>
            )}
            {post.isPublished ? (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                已發布
              </span>
            ) : (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                草稿
              </span>
            )}
          </div>
        </div>

        {/* 標籤和資訊 */}
        <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
          <span>發布日期: {formatDate(post.publishedAt)}</span>
          <span>更新: {formatDate(post.updatedAt)}</span>
          {post.tags?.length > 0 && (
            <div className="flex gap-1">
              {post.tags.slice(0, 3).map((pt: any) => (
                <span
                  key={pt.tagId}
                  className="rounded bg-zinc-100 px-1.5 py-0.5"
                >
                  {pt.tag.name}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-zinc-400">+{post.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex flex-shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Link
          href={`/admin/blog/${post.id}/edit`}
          className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
        >
          編輯
        </Link>
        <Link
          href={`/blog/${post.slug}`}
          target="_blank"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50"
        >
          預覽
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:bg-zinc-400"
        >
          {deleting ? "..." : "刪除"}
        </button>
      </div>
    </div>
  );
}
