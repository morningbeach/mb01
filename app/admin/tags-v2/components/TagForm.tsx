"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TagFormProps = {
  tag?: any;
};

export function TagForm({ tag }: TagFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: tag?.slug || "",
    name: tag?.name || "",
    name_en: tag?.name_en || "",
    name_zh: tag?.name_zh || "",
    subtitle: tag?.subtitle || "",
    subtitle_en: tag?.subtitle_en || "",
    subtitle_zh: tag?.subtitle_zh || "",
    color: tag?.color || "#3b82f6",
  });

  // 自動生成 slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // 從英文名稱生成 slug
  const handleNameEnChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name_en: value,
      // 如果 slug 是空的或是之前自動生成的，則自動更新
      slug: !prev.slug || prev.slug === generateSlug(prev.name_en) 
        ? generateSlug(value) 
        : prev.slug,
      // 同步更新 name（保留向下相容）
      name: value || prev.name_zh,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證必填欄位
    if (!formData.name_en || !formData.name_zh) {
      alert("請填寫中文名稱和英文名稱！");
      return;
    }
    
    setLoading(true);

    try {
      const url = tag
        ? `/api/admin/tags-v2/${tag.id}`
        : "/api/admin/tags-v2";
      
      const method = tag ? "PUT" : "POST";

      // 確保 name 欄位有值（用於向下相容）
      const submitData = {
        ...formData,
        name: formData.name || formData.name_zh || formData.name_en,
        subtitle: formData.subtitle || formData.subtitle_zh || formData.subtitle_en,
        version: 2,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "操作失敗");
      }

      alert(tag ? "更新成功！" : "建立成功！");
      router.push("/admin/tags-v2");
      router.refresh();
    } catch (error: any) {
      alert(`錯誤: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tag) return;
    if (!confirm(`確定要刪除標籤「${tag.name}」嗎？此操作無法復原！`)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tags-v2/${tag.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "刪除失敗");
      }

      alert("刪除成功！");
      router.push("/admin/tags-v2");
      router.refresh();
    } catch (error: any) {
      alert(`錯誤: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 中英文名稱 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">🌐 標籤名稱（中英文）</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              英文名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name_en}
              onChange={(e) => handleNameEnChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="Paper Box"
            />
            <p className="mt-1 text-xs text-zinc-500">會自動生成 URL Slug</p>
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
              placeholder="紙盒"
            />
          </div>
        </div>
      </div>

      {/* 中英文副標題 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">📝 副標題（選填）</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              英文副標題
            </label>
            <input
              type="text"
              value={formData.subtitle_en}
              onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="Paper Box Packaging"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              中文副標題
            </label>
            <input
              type="text"
              value={formData.subtitle_zh}
              onChange={(e) => setFormData({ ...formData, subtitle_zh: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="紙盒包裝"
            />
          </div>
        </div>
      </div>

      {/* URL Slug 和顏色 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">⚙️ 進階設定</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm"
              placeholder="paper-box"
            />
            <p className="mt-1 text-xs text-zinc-500">用於 URL，只能使用小寫英文、數字和連字號</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              標籤顏色
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-14 rounded-lg border border-zinc-300 cursor-pointer"
              />
              <div className="flex gap-1">
                {["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#6B7280"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === c ? "border-zinc-800 scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 預覽 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">👁️ 預覽</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-zinc-500 mb-2">英文版</p>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium text-white"
                style={{ backgroundColor: formData.color }}
              >
                {formData.name_en || "Tag Name"}
              </span>
              {formData.subtitle_en && (
                <span className="text-sm text-zinc-500">
                  {formData.subtitle_en}
                </span>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-xs text-zinc-500 mb-2">中文版</p>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium text-white"
                style={{ backgroundColor: formData.color }}
              >
                {formData.name_zh || "標籤名稱"}
              </span>
              {formData.subtitle_zh && (
                <span className="text-sm text-zinc-500">
                  {formData.subtitle_zh}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:bg-zinc-300"
        >
          {loading ? "處理中..." : tag ? "更新標籤" : "建立標籤"}
        </button>
        
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-6 py-2 text-zinc-700 hover:bg-zinc-50"
        >
          取消
        </button>

        {tag && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="ml-auto rounded-lg bg-red-500 px-6 py-2 text-white hover:bg-red-600 disabled:bg-zinc-300"
          >
            刪除標籤
          </button>
        )}
      </div>
    </form>
  );
}
