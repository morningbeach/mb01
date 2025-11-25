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
    subtitle: tag?.subtitle || "",
    color: tag?.color || "#3b82f6",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = tag
        ? `/api/admin/tags-v2/${tag.id}`
        : "/api/admin/tags-v2";
      
      const method = tag ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, version: 2 }),
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
      {/* 基本資訊 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">基本資訊</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              標籤名稱 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="紙盒包裝"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="paper-box"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700">
              副標題
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="Paper Box Packaging"
            />
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
                className="h-10 w-20 rounded-lg border border-zinc-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2"
                placeholder="#3b82f6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 預覽 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">預覽</h2>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium text-white"
            style={{ backgroundColor: formData.color }}
          >
            {formData.name || "標籤名稱"}
          </span>
          {formData.subtitle && (
            <span className="text-sm text-zinc-500">
              {formData.subtitle}
            </span>
          )}
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
