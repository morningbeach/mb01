"use client";

import { useState, useEffect } from "react";

interface ProductTagManagerProps {
  productId?: string; // 編輯模式才有
  initialTagIds?: string[];
  onChange: (tagIds: string[]) => void;
}

interface Tag {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  subtitle: string | null;
}

export default function ProductTagManager({
  productId,
  initialTagIds = [],
  onChange,
}: ProductTagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTagIds);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagData, setNewTagData] = useState({
    name: "",
    slug: "",
    color: "#3b82f6",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    onChange(selectedTagIds);
  }, [selectedTagIds]);

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
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/admin/tags-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTagData, version: 2 }),
      });

      if (!res.ok) throw new Error("Failed to create tag");
      
      const data = await res.json();
      const newTag = data.tag;

      setTags([...tags, newTag]);
      setSelectedTagIds([...selectedTagIds, newTag.id]);
      setNewTagData({ name: "", slug: "", color: "#3b82f6" });
      setShowNewTagForm(false);
      alert("標籤建立成功！");
    } catch (error) {
      alert("建立標籤失敗");
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const filteredTags = query
    ? tags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(query.toLowerCase()) ||
          tag.slug.toLowerCase().includes(query.toLowerCase())
      )
    : tags;

  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  if (loading) {
    return <div className="text-sm text-zinc-500">載入標籤中...</div>;
  }

  return (
    <div className="space-y-4">
      {/* 已選擇的標籤 */}
      {selectedTags.length > 0 && (
        <div>
          <div className="text-sm font-medium text-zinc-700 mb-2">
            已選擇的標籤 ({selectedTags.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white hover:opacity-80"
                style={{ backgroundColor: tag.color || "#3b82f6" }}
              >
                {tag.name}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 搜尋框 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋標籤..."
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          type="button"
          onClick={() => setShowNewTagForm(!showNewTagForm)}
          className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
        >
          + 新增標籤
        </button>
      </div>

      {/* 新增標籤表單 */}
      {showNewTagForm && (
        <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4">
          <h3 className="font-semibold text-zinc-900 mb-3">建立新標籤</h3>
          <form onSubmit={handleCreateTag} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="標籤名稱 *"
                value={newTagData.name}
                onChange={(e) => setNewTagData({ ...newTagData, name: e.target.value })}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                required
                placeholder="slug *"
                value={newTagData.slug}
                onChange={(e) => setNewTagData({ ...newTagData, slug: e.target.value })}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newTagData.color}
                onChange={(e) => setNewTagData({ ...newTagData, color: e.target.value })}
                className="h-10 w-16 rounded-lg border border-zinc-300 cursor-pointer"
              />
              <span className="text-sm text-zinc-600">選擇顏色</span>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:bg-zinc-300"
              >
                {creating ? "建立中..." : "建立標籤"}
              </button>
              <button
                type="button"
                onClick={() => setShowNewTagForm(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 可選標籤列表 */}
      <div>
        <div className="text-sm font-medium text-zinc-700 mb-2">
          可選標籤 ({filteredTags.length})
        </div>
        <div className="max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-2">
          {filteredTags.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">
              {query ? `找不到符合 "${query}" 的標籤` : "尚無標籤"}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`
                      inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all
                      ${
                        isSelected
                          ? "ring-2 ring-offset-2 text-white"
                          : "opacity-50 hover:opacity-100 text-white"
                      }
                    `}
                    style={{
                      backgroundColor: tag.color || "#3b82f6",
                      ringColor: tag.color || "#3b82f6",
                    }}
                  >
                    {isSelected && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
