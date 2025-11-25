"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PageRowProps {
  page: any;
  index: number;
  totalPages: number;
}

export function PageRow({ page, index, totalPages }: PageRowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggleEnabled = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/pages/${page.id}/toggle-enabled`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNav = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/pages/${page.id}/toggle-nav`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleMoveUp = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/pages/${page.id}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: "up" }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleMoveDown = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/pages/${page.id}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: "down" }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`確定要刪除「${page.navLabel_zh || page.slug}」嗎？`)) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/pages/${page.id}`, { method: "DELETE" });
      router.refresh();
    } catch (error) {
      alert("刪除失敗");
      setLoading(false);
    }
  };

  return (
    <tr key={page.id} className="hover:bg-zinc-50">
      {/* 排序 */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={handleMoveUp}
            disabled={loading || index === 0}
            className="rounded p-1 hover:bg-zinc-200 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            onClick={handleMoveDown}
            disabled={loading || index === totalPages - 1}
            className="rounded p-1 hover:bg-zinc-200 disabled:opacity-30"
          >
            ↓
          </button>
        </div>
      </td>

      {/* 頁面名稱 */}
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-zinc-900">
            {page.navLabel_zh || page.slug}
            {page.isDefault && (
              <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                預設
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">/{page.slug}</div>
        </div>
      </td>

      {/* 類型 */}
      <td className="px-4 py-3 text-sm text-zinc-600">{page.type}</td>

      {/* 啟用狀態 */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={handleToggleEnabled}
          disabled={loading}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            page.isEnabled
              ? "bg-green-100 text-green-700"
              : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {page.isEnabled ? "啟用" : "關閉"}
        </button>
      </td>

      {/* 顯示在導航 */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={handleToggleNav}
          disabled={loading}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            page.showInNav
              ? "bg-blue-100 text-blue-700"
              : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {page.showInNav ? "顯示" : "隱藏"}
        </button>
      </td>

      {/* 操作 */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin-v2/pages/${page.id}/edit`}
            className="rounded px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
          >
            編輯
          </Link>
          {!page.isDefault && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="rounded px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              刪除
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
