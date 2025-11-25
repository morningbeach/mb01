"use client";

import { useState, useEffect } from "react";

interface TagSelectorDynamicProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

interface Tag {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  subtitle: string | null;
}

export default function TagSelectorDynamic({ selectedTagIds, onChange }: TagSelectorDynamicProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const res = await fetch("/api/admin/tags-v2");
      if (!res.ok) throw new Error("Failed to fetch tags");
      const data = await res.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error("載入標籤失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const filteredTags = query
    ? tags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(query.toLowerCase()) ||
          tag.slug.toLowerCase().includes(query.toLowerCase())
      )
    : tags;

  if (loading) {
    return <div className="text-sm text-zinc-500">載入標籤中...</div>;
  }

  if (tags.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
        <p className="text-sm text-zinc-600 mb-2">尚無可用標籤</p>
        <a
          href="/admin/tags-v2/new"
          target="_blank"
          className="inline-block text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          前往建立標籤 →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 搜尋框 */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜尋標籤名稱或 slug..."
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />

      {/* TAG 列表 */}
      <div className="max-h-64 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        {filteredTags.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">
            找不到符合 "{query}" 的標籤
          </p>
        ) : (
          <div className="space-y-2">
            {filteredTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`
                    w-full flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }
                  `}
                >
                  {/* Checkbox */}
                  <div
                    className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-zinc-300 bg-white"
                      }
                    `}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Color */}
                  {tag.color && (
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                  )}

                  {/* Tag Info */}
                  <div className="flex-1">
                    <div className="font-medium text-zinc-900">{tag.name}</div>
                    {tag.subtitle && (
                      <div className="text-xs text-zinc-500 mt-0.5">{tag.subtitle}</div>
                    )}
                    <div className="text-xs font-mono text-zinc-400 mt-0.5">{tag.slug}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 已選擇提示 */}
      <div className="flex items-center justify-between text-xs text-zinc-600">
        <span>已選擇 {selectedTagIds.length} 個標籤</span>
        {selectedTagIds.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            清除全部
          </button>
        )}
      </div>
    </div>
  );
}
