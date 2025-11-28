"use client";

import { useState } from "react";
import Link from "next/link";

interface Tag {
  id: string;
  name: string;
  name_en?: string | null;
  name_zh?: string | null;
  subtitle?: string | null;
  subtitle_en?: string | null;
  subtitle_zh?: string | null;
  slug: string;
  color?: string | null;
  version: number;
  _count: {
    products: number;
  };
}

interface TagsListClientProps {
  initialTags: Tag[];
  tagUsageMap: Record<string, number>;
}

export default function TagsListClient({ initialTags, tagUsageMap }: TagsListClientProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 取得顯示名稱
  const getDisplayName = (tag: Tag) => {
    if (lang === "en") {
      return tag.name_en || tag.name;
    }
    return tag.name_zh || tag.name;
  };

  // 取得顯示副標題
  const getDisplaySubtitle = (tag: Tag) => {
    if (lang === "en") {
      return tag.subtitle_en || tag.subtitle;
    }
    return tag.subtitle_zh || tag.subtitle;
  };

  // 刪除標籤
  const handleDelete = async (tagId: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/tags-v2/${tagId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (data.success) {
        setTags((prev) => prev.filter((t) => t.id !== tagId));
        setDeleteConfirm(null);
      } else {
        alert(data.message || "刪除失敗");
      }
    } catch (error) {
      alert("刪除失敗");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* 控制列 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            V2 新版本
          </span>
          <span className="text-sm text-zinc-500">共 {tags.length} 個標籤</span>
          
          {/* 語言切換 */}
          <div className="ml-4 flex rounded-lg border border-zinc-200 overflow-hidden">
            <button
              onClick={() => setLang("zh")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                lang === "zh"
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                lang === "en"
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              English
            </button>
          </div>
        </div>
        <Link
          href="/admin/tags-v2/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + 新增標籤
        </Link>
      </div>

      {/* 標籤列表 */}
      {tags.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <h3 className="text-lg font-semibold text-zinc-900">
            尚無 V2 版本標籤
          </h3>
          <p className="mt-2 text-sm text-zinc-600">
            開始建立新版本的標籤，用於組織商品和分類
          </p>
          <Link
            href="/admin/tags-v2/new"
            className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            建立第一個 V2 標籤
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="relative rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <Link
                href={`/admin/tags-v2/${tag.id}`}
                className="block"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900">
                      {getDisplayName(tag)}
                    </h3>
                    {getDisplaySubtitle(tag) && (
                      <p className="mt-1 text-xs text-zinc-600">
                        {getDisplaySubtitle(tag)}
                      </p>
                    )}
                    {/* 顯示雙語名稱 */}
                    <p className="mt-1 text-xs text-zinc-400">
                      {tag.name_zh && tag.name_en ? (
                        lang === "zh" ? `EN: ${tag.name_en}` : `中: ${tag.name_zh}`
                      ) : null}
                    </p>
                  </div>
                  {tag.color && (
                    <div
                      className="h-6 w-6 rounded-full border border-zinc-200 flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                  )}
                </div>

                {/* 使用統計 */}
                <div className="mt-3 flex gap-3 text-xs text-zinc-500">
                  <span>📦 {tag._count.products} 商品</span>
                  <span>📁 {tagUsageMap[tag.id] || 0} 分類</span>
                </div>
              </Link>

              {/* 刪除按鈕 */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteConfirm(tag.id);
                }}
                className="absolute top-2 right-2 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="刪除標籤"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 刪除確認 Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-red-600 mb-2">⚠️ 確認刪除</h3>
            <p className="text-gray-600 text-sm mb-4">
              確定要刪除這個標籤嗎？此操作無法復原。
            </p>
            {(() => {
              const tag = tags.find((t) => t.id === deleteConfirm);
              if (tag && tag._count.products > 0) {
                return (
                  <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">
                    ⚠️ 此標籤被 {tag._count.products} 個產品使用中，無法刪除。請先移除產品的標籤關聯。
                  </p>
                );
              }
              return null;
            })()}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isDeleting}
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isDeleting || (tags.find((t) => t.id === deleteConfirm)?._count.products ?? 0) > 0}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "刪除中..." : "確認刪除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
