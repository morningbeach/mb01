"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type NodeFormProps = {
  node?: any;
  allNodes: Array<{
    id: string;
    slug: string;
    name_zh: string;
    name_en: string;
    depth: number;
  }>;
};

type Tag = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  subtitle: string | null;
};

const displayModes = [
  { value: "hero-cards", label: "英雄區+卡片" },
  { value: "grid", label: "網格展示" },
  { value: "masonry", label: "瀑布流" },
  { value: "waterfall", label: "多列瀑布" },
  { value: "carousel", label: "輪播" },
  { value: "list", label: "列表" },
  { value: "product-detail", label: "商品詳細" },
];

export function CategoryNodeForm({ node, allNodes, initialParentId }: NodeFormProps & { initialParentId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(true);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: node?.slug || "",
    name_zh: node?.name_zh || "",
    name_en: node?.name_en || "",
    description_zh: node?.description_zh || "",
    description_en: node?.description_en || "",
    parentId: node?.parentId || initialParentId || null,
    displayMode: node?.displayMode || "grid",
    order: node?.order || 0,
    coverImage: node?.coverImage || "",
    heroImage: node?.heroImage || "",
    icon: node?.icon || "",
    colorTheme: node?.colorTheme || "#3b82f6",
    tagIds: node?.tagIds || [],
    isActive: node?.isActive ?? true,
    isLeaf: node?.isLeaf ?? false,
    isHidden: node?.isHidden ?? false,
    showInMenu: node?.showInMenu ?? true,
    seoTitle_zh: node?.seoTitle_zh || "",
    seoTitle_en: node?.seoTitle_en || "",
    seoDescription_zh: node?.seoDescription_zh || "",
    seoDescription_en: node?.seoDescription_en || "",
  });
  // 使用 OpenAI 生成 slug 和英文名稱
  async function handleAiTranslate() {
    if (!formData.name_zh) {
      alert("請先輸入中文名稱");
      return;
    }
    if (!openAiKey) {
      alert("請輸入 OpenAI API Key");
      return;
    }
    setAiLoading(true);
    try {
      const prompt = `請將以下中文分類名稱翻譯成簡潔專業的英文（20字以內），並生成一個 url-friendly slug（小寫英文、連字號分隔）。\n\n中文名稱：${formData.name_zh}\n\n請以 JSON 格式回覆：{\"name_en\": \"英文名稱\", \"slug\": \"slug\"}`;
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      });
      if (!response.ok) {
        throw new Error("OpenAI API 錯誤");
      }
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      let result;
      try {
        result = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
      } catch {
        alert("AI 回覆解析失敗: " + text);
        setAiLoading(false);
        return;
      }
      setFormData(prev => ({
        ...prev,
        name_en: result.name_en || prev.name_en,
        slug: result.slug || prev.slug,
      }));
      alert("AI 生成成功！");
    } catch (err) {
      alert("AI 生成失敗: " + err.message);
    } finally {
      setAiLoading(false);
    }
  }

  // 載入所有 TAG
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/admin/tags-v2");
        if (res.ok) {
          const data = await res.json();
          setAllTags(data.tags || []);
        }
      } catch (error) {
        console.error("載入 TAG 失敗:", error);
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  // 切換 TAG 選擇
  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }));
  };

  // 過濾 TAG
  const filteredTags = allTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證必填欄位
    if (!formData.name_zh.trim()) {
      alert("請輸入中文名稱");
      return;
    }
    if (!formData.name_en.trim()) {
      alert("請輸入英文名稱");
      return;
    }
    if (!node && !formData.slug.trim()) {
      alert("請輸入 Slug");
      return;
    }
    
    setLoading(true);

    try {
      const url = node
        ? `/api/admin/category-tree/${node.id}`
        : "/api/admin/category-tree";
      
      const method = node ? "PUT" : "POST";

      // 構建 payload
      const payload: any = {
        name_zh: formData.name_zh.trim(),
        name_en: formData.name_en.trim(),
        displayMode: formData.displayMode,
        tagIds: formData.tagIds,
        isActive: formData.isActive,
        isLeaf: formData.isLeaf,
        isHidden: formData.isHidden,
        showInMenu: formData.showInMenu,
      };
      
      // slug - 新建時必須
      if (!node) {
        payload.slug = formData.slug.trim();
      }
      
      // parentId - 新建時必須
      if (!node) {
        payload.parentId = formData.parentId;
      }
      
      // 編輯時：只在 parentId 確實改變時才發送結構欄位
      if (node && formData.parentId !== node.parentId) {
        payload.parentId = formData.parentId;
        payload.slug = formData.slug;
      }
      
      console.log("=== Form Submit Debug ===");
      console.log("Node exists:", !!node);
      console.log("FormData slug:", formData.slug);
      console.log("Node slug:", node?.slug);
      console.log("FormData parentId:", formData.parentId);
      console.log("Node parentId:", node?.parentId);
      console.log("Final payload:", JSON.stringify(payload, null, 2));
      
      // 可選欄位
      if (formData.description_zh) payload.description_zh = formData.description_zh;
      if (formData.description_en) payload.description_en = formData.description_en;
      if (formData.order) payload.order = Number(formData.order);
      if (formData.coverImage) payload.coverImage = formData.coverImage;
      if (formData.heroImage) payload.heroImage = formData.heroImage;
      if (formData.icon) payload.icon = formData.icon;
      if (formData.colorTheme) payload.colorTheme = formData.colorTheme;
      if (formData.seoTitle_zh) payload.seoTitle_zh = formData.seoTitle_zh;
      if (formData.seoTitle_en) payload.seoTitle_en = formData.seoTitle_en;
      if (formData.seoDescription_zh) payload.seoDescription_zh = formData.seoDescription_zh;
      if (formData.seoDescription_en) payload.seoDescription_en = formData.seoDescription_en;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "操作失敗");
      }

      alert(node ? "更新成功！" : "建立成功！");
      router.push("/admin/category-tree");
      router.refresh();
    } catch (error: any) {
      console.error("提交錯誤:", error);
      alert(`錯誤: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!node) return;
    if (!confirm(`確定要刪除「${node.name_zh}」嗎？此操作無法復原！`)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/category-tree/${node.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "刪除失敗");
      }

      alert("刪除成功！");
      router.push("/admin/category-tree");
      router.refresh();
    } catch (error: any) {
      alert(`錯誤: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本資訊 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">基本資訊</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="paper-packaging"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              父節點
            </label>
            <select
              value={formData.parentId || ""}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="">無（根節點）</option>
              {allNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {"  ".repeat(n.depth)}{n.name_zh} ({n.slug})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              中文名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name_zh}
              onChange={(e) => setFormData({ ...formData, name_zh: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="紙器包裝"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              英文名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="Paper Packaging"
            />
          </div>

          {/* AI 翻譯功能 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700">OpenAI API Key（前台輸入）</label>
            <input
              type="password"
              value={openAiKey}
              onChange={e => setOpenAiKey(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="sk-..."
            />
            <button
              type="button"
              className="mt-2 rounded bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-blue-300"
              onClick={handleAiTranslate}
              disabled={aiLoading}
            >
              {aiLoading ? "AI 生成中..." : "AI 生成英文名稱與 Slug"}
            </button>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700">
              中文描述
            </label>
            <textarea
              value={formData.description_zh}
              onChange={(e) => setFormData({ ...formData, description_zh: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              rows={3}
              placeholder="精緻紙盒與印刷品製作"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700">
              英文描述
            </label>
            <textarea
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              rows={3}
              placeholder="Exquisite paper box and printing production"
            />
          </div>
        </div>
      </div>

      {/* 展示設定 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">展示設定</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              展示模式
            </label>
            <select
              value={formData.displayMode}
              onChange={(e) => setFormData({ ...formData, displayMode: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              {displayModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              排序
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              圖示 (Emoji)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="📦"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700">
              封面圖片
            </label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="https://..."
            />
            {formData.coverImage && (
              <div className="mt-2">
                <Image
                  src={formData.coverImage}
                  alt="封面圖片預覽"
                  width={200}
                  height={120}
                  className="rounded-lg border object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              主題色
            </label>
            <input
              type="color"
              value={formData.colorTheme}
              onChange={(e) => setFormData({ ...formData, colorTheme: e.target.value })}
              className="mt-1 h-10 w-full rounded-lg border border-zinc-300"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-zinc-700">
              Hero 橫幅圖片
            </label>
            <input
              type="url"
              value={formData.heroImage}
              onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="https://..."
            />
            {formData.heroImage && (
              <div className="mt-2">
                <Image
                  src={formData.heroImage}
                  alt="Hero 圖片預覽"
                  width={300}
                  height={150}
                  className="rounded-lg border object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TAG 設定 (葉節點用) */}
      {formData.isLeaf && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">TAG 篩選設定</h2>
              <p className="mt-1 text-sm text-zinc-600">
                選擇 TAG 來篩選此分類下要顯示的產品。只有帶有這些 TAG 的產品會出現在前台。
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              已選 {formData.tagIds.length} 個
            </span>
          </div>

          {/* 搜尋框 */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋 TAG..."
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* 標籤雲 */}
          {loadingTags ? (
            <div className="flex items-center justify-center py-8 text-zinc-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500"></div>
              <span className="ml-2">載入中...</span>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              {searchTerm ? `找不到包含「${searchTerm}」的 TAG` : "尚無可用的 TAG"}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag) => {
                const isSelected = formData.tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`
                      group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
                      transition-all duration-200
                      ${isSelected
                        ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }
                    `}
                    style={
                      isSelected && tag.color
                        ? { backgroundColor: tag.color, color: 'white' }
                        : !isSelected && tag.color
                        ? { backgroundColor: `${tag.color}15`, color: tag.color }
                        : undefined
                    }
                  >
                    {isSelected && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>{tag.name}</span>
                    {tag.subtitle && (
                      <span className={`text-xs ${isSelected ? 'opacity-75' : 'opacity-60'}`}>
                        · {tag.subtitle}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* 已選 TAG 摘要 */}
          {formData.tagIds.length > 0 && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="text-xs font-medium text-blue-700 mb-2">已選擇的 TAG：</div>
              <div className="flex flex-wrap gap-1">
                {formData.tagIds.map((tagId: string) => {
                  const tag = allTags.find(t => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <span
                      key={tagId}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs text-zinc-700"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => toggleTag(tagId)}
                        className="text-zinc-400 hover:text-zinc-600"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 狀態設定 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">狀態設定</h2>
        
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="text-sm text-zinc-700">啟用（顯示在前台）</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isLeaf}
              onChange={(e) => setFormData({ ...formData, isLeaf: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="text-sm text-zinc-700">葉節點（最底層，可掛商品）</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isHidden}
              onChange={(e) => setFormData({ ...formData, isHidden: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="text-sm text-zinc-700">隱藏（不顯示在前台，用於根節點）</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.showInMenu}
              onChange={(e) => setFormData({ ...formData, showInMenu: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="text-sm text-zinc-700">顯示在導航選單</span>
          </label>
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">SEO 設定</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              SEO 標題（中文）
            </label>
            <input
              type="text"
              value={formData.seoTitle_zh}
              onChange={(e) => setFormData({ ...formData, seoTitle_zh: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              SEO 標題（英文）
            </label>
            <input
              type="text"
              value={formData.seoTitle_en}
              onChange={(e) => setFormData({ ...formData, seoTitle_en: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              SEO 描述（中文）
            </label>
            <textarea
              value={formData.seoDescription_zh}
              onChange={(e) => setFormData({ ...formData, seoDescription_zh: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              SEO 描述（英文）
            </label>
            <textarea
              value={formData.seoDescription_en}
              onChange={(e) => setFormData({ ...formData, seoDescription_en: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-6">
        <div>
          {node && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              刪除節點
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "處理中..." : node ? "更新節點" : "建立節點"}
          </button>
        </div>
      </div>
    </form>
  );
}
