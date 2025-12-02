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
  name_zh?: string;
  name_en?: string;
  color: string | null;
  subtitle: string | null;
}

interface Dimension {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  icon: string | null;
  tags: Tag[];
}

export default function ProductTagManager({
  productId,
  initialTagIds = [],
  onChange,
}: ProductTagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
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
    loadDimensions();
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

  const loadDimensions = async () => {
    try {
      const res = await fetch("/api/filter-dimensions?category=print-packaging");
      if (!res.ok) throw new Error("Failed to fetch dimensions");
      const data = await res.json();
      if (data.success) {
        setDimensions(data.data || []);
      }
    } catch (error) {
      console.error("載入篩選器維度失敗:", error);
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
  
  // 從 dimensions 中提取所有標籤的 ID
  const dimensionTagIds = new Set(
    dimensions.flatMap(d => d.tags.map(t => t.id))
  );

  if (loading) {
    return <div className="text-sm text-zinc-500">載入標籤中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 已選擇的標籤 */}
      {selectedTags.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="text-sm font-semibold text-zinc-900 mb-3">
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
                {tag.name_zh || tag.name}
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
      
      {/* 兩欄佈局 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 第一欄：舊版標籤 */}
        <div className="rounded-lg border-2 border-zinc-300 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-900">
              舊版標籤庫
            </h3>
            <button
              type="button"
              onClick={() => setShowNewTagForm(!showNewTagForm)}
              className="rounded-lg bg-green-500 px-3 py-1 text-xs font-medium text-white hover:bg-green-600"
            >
              + 新增
            </button>
          </div>
          
          {/* 搜尋框 */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋標籤..."
            className="w-full mb-3 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          {/* 新增標籤表單 */}
          {showNewTagForm && (
            <div className="mb-3 rounded-lg border-2 border-green-500 bg-green-50 p-3">
              <h4 className="font-semibold text-zinc-900 mb-2 text-sm">建立新標籤</h4>
              <form onSubmit={handleCreateTag} className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="標籤名稱 *"
                  value={newTagData.name}
                  onChange={(e) => setNewTagData({ ...newTagData, name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="slug *"
                  value={newTagData.slug}
                  onChange={(e) => setNewTagData({ ...newTagData, slug: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 rounded-lg bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600 disabled:bg-zinc-300"
                  >
                    {creating ? "建立中..." : "建立"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewTagForm(false)}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 舊版標籤列表 */}
          <div className="max-h-96 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-2">
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
                        inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all
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
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {tag.name_zh || tag.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* 第二欄：篩選器標籤 */}
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">
            篩選器標籤 <span className="text-xs font-normal text-blue-700">(點擊加入已選)</span>
          </h3>
          
          <div className="max-h-96 overflow-y-auto space-y-3">
            {dimensions.length === 0 ? (
              <p className="text-sm text-blue-600 text-center py-4">載入中...</p>
            ) : (
              dimensions.map((dimension) => (
                <div key={dimension.id} className="rounded-lg border border-blue-200 bg-white p-3">
                  <div className="text-xs font-semibold text-zinc-700 mb-2">
                    {dimension.name_zh}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dimension.tags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            if (!isSelected) {
                              setSelectedTagIds([...selectedTagIds, tag.id]);
                            }
                          }}
                          className={`
                            inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all
                            ${
                              isSelected
                                ? "bg-green-500 text-white cursor-default"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer"
                            }
                          `}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {tag.name_zh || tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
