"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function CreatePageForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      slug: formData.get("slug")?.toString(),
      type: formData.get("type")?.toString(),
      navLabel_zh: formData.get("navLabel_zh")?.toString(),
      navLabel_en: formData.get("navLabel_en")?.toString(),
      label_zh: formData.get("label_zh")?.toString(),
      label_en: formData.get("label_en")?.toString(),
      title_zh: formData.get("title_zh")?.toString(),
      title_en: formData.get("title_en")?.toString(),
      desc_zh: formData.get("desc_zh")?.toString(),
      desc_en: formData.get("desc_en")?.toString(),
      showInNav: formData.get("showInNav") === "on",
      isEnabled: formData.get("isEnabled") === "on",
    };

    try {
      const res = await fetch("/api/admin/pages/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "建立失敗");
      }

      const result = await res.json();
      router.push(`/admin-v2/pages/${result.id}/edit`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* 頁面類型選擇 */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-zinc-900">
          頁面類型 *
        </label>
        <select
          name="type"
          required
          className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
        >
          <option value="">-- 選擇頁面類型 --</option>
          <option value="ABOUT">About 類型（品牌故事）</option>
          <option value="FACTORY">Factory 類型（工廠實力）</option>
          <option value="CONTACT">Contact 類型（聯絡表單）</option>
          <option value="CUSTOM">自訂頁面（Homepage Section 系統）</option>
        </select>
        <p className="mt-1 text-xs text-zinc-500">
          選擇後會載入對應的預設內容結構
        </p>
      </div>

      {/* URL Slug */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-zinc-900">
          網址路徑 (Slug) *
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">/</span>
          <input
            type="text"
            name="slug"
            required
            pattern="[a-z0-9-]+"
            placeholder="my-custom-page"
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          只能使用小寫英文、數字和連字號，例如：custom-campaign
        </p>
      </div>

      <hr className="my-6 border-zinc-200" />

      {/* 導覽列名稱 */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-900">
            導覽列名稱（中文）*
          </label>
          <input
            type="text"
            name="navLabel_zh"
            required
            placeholder="關於我們"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-900">
            導覽列名稱（英文）
          </label>
          <input
            type="text"
            name="navLabel_en"
            placeholder="About"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>
      </div>

      {/* 頁面標籤 */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-900">
            頁面標籤（中文）
          </label>
          <input
            type="text"
            name="label_zh"
            placeholder="品牌故事"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
          <p className="mt-1 text-xs text-zinc-500">顯示在標題上方的小標籤</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-900">
            頁面標籤（英文）
          </label>
          <input
            type="text"
            name="label_en"
            placeholder="Brand Story"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>
      </div>

      {/* 頁面標題 */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-900">
            頁面標題（中文）*
          </label>
          <input
            type="text"
            name="title_zh"
            required
            placeholder="歡迎來到我們的網站"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-900">
            頁面標題（英文）
          </label>
          <input
            type="text"
            name="title_en"
            placeholder="Welcome to our website"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>
      </div>

      {/* 頁面描述 */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-900">
            頁面描述（中文）
          </label>
          <textarea
            name="desc_zh"
            rows={4}
            placeholder="簡短描述這個頁面的內容..."
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-900">
            頁面描述（英文）
          </label>
          <textarea
            name="desc_en"
            rows={4}
            placeholder="A brief description of this page..."
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>
      </div>

      <hr className="my-6 border-zinc-200" />

      {/* 顯示設定 */}
      <div className="mb-6 space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="showInNav"
            defaultChecked
            className="h-4 w-4 rounded border-zinc-300"
          />
          <div>
            <span className="text-sm font-medium text-zinc-900">顯示在導航列</span>
            <p className="text-xs text-zinc-500">勾選後，此頁面會出現在網站頂部導航列</p>
          </div>
        </label>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isEnabled"
            className="h-4 w-4 rounded border-zinc-300"
          />
          <div>
            <span className="text-sm font-medium text-zinc-900">立即啟用頁面</span>
            <p className="text-xs text-zinc-500">勾選後，頁面建立後會立即在前台顯示（預設為關閉）</p>
          </div>
        </label>
      </div>

      <hr className="my-6 border-zinc-200" />

      {/* 操作按鈕 */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin-v2/pages"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
        >
          取消
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "建立中..." : "建立頁面並開始編輯"}
        </button>
      </div>
    </form>
  );
}
