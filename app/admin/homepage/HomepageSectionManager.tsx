"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Section {
  id: number;
  type: string;
  order: number;
  enabled: boolean;
  contentZh: any;
  contentEn: any;
}

const SECTION_TYPE_NAMES: Record<string, string> = {
  HERO: "首頁橫幅",
  PRODUCTS: "精選產品",
  WHY: "為什麼選擇我們",
  FACTORY: "工廠介紹",
  CTA: "行動呼籲",
  GALLERY: "圖片廊",
};

export function HomepageSectionManager({ sections }: { sections: Section[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<number | null>(null);

  const handleToggleEnabled = async (sectionId: number, currentEnabled: boolean) => {
    setIsLoading(sectionId);
    try {
      const response = await fetch(`/api/admin/homepage/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("操作失敗");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("操作失敗");
    } finally {
      setIsLoading(null);
    }
  };

  const handleMoveUp = async (sectionId: number, currentOrder: number) => {
    if (currentOrder === 1) return;
    
    setIsLoading(sectionId);
    try {
      const response = await fetch(`/api/admin/homepage/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: currentOrder - 1 }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("操作失敗");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("操作失敗");
    } finally {
      setIsLoading(null);
    }
  };

  const handleMoveDown = async (sectionId: number, currentOrder: number) => {
    if (currentOrder === sections.length) return;
    
    setIsLoading(sectionId);
    try {
      const response = await fetch(`/api/admin/homepage/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: currentOrder + 1 }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("操作失敗");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("操作失敗");
    } finally {
      setIsLoading(null);
    }
  };

  const handleDelete = async (sectionId: number, typeName: string) => {
    if (!confirm(`確定要刪除「${typeName}」區塊嗎？此操作無法復原。`)) {
      return;
    }

    setIsLoading(sectionId);
    try {
      const response = await fetch(`/api/admin/homepage/sections/${sectionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("刪除失敗");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("刪除失敗");
    } finally {
      setIsLoading(null);
    }
  };

  const getEditUrl = (section: Section) => {
    const typeMap: Record<string, string> = {
      HERO: `/admin/homepage/hero/${section.id}`,
      PRODUCTS: `/admin/homepage/products/${section.id}`,
      WHY: `/admin/homepage/why/${section.id}`,
      FACTORY: `/admin/homepage/factory/${section.id}`,
      CTA: `/admin/homepage/cta/${section.id}`,
      GALLERY: `/admin/homepage/gallery/${section.id}`,
    };
    return typeMap[section.type] || `/admin/homepage/${section.id}`;
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">區塊列表</h2>
        <div className="text-sm text-zinc-500">
          共 {sections.length} 個區塊
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-zinc-200 p-12 text-center">
          <p className="text-sm text-zinc-500">尚無區塊</p>
          <p className="mt-2 text-xs text-zinc-400">
            請透過資料庫或 API 新增首頁區塊
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`group relative rounded-lg border-2 p-4 transition-all ${
                section.enabled
                  ? "border-zinc-200 bg-white hover:border-blue-300 hover:shadow-sm"
                  : "border-zinc-100 bg-zinc-50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                {/* 左側：區塊資訊 */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
                      {section.order}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-900">
                          {SECTION_TYPE_NAMES[section.type] || section.type}
                        </span>
                        <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-mono text-zinc-600">
                          {section.type}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-500">
                        {section.enabled ? "顯示中" : "已隱藏"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右側：操作按鈕 */}
                <div className="flex items-center gap-2">
                  {/* 排序按鈕 */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMoveUp(section.id, section.order)}
                      disabled={index === 0 || isLoading === section.id}
                      className="rounded border border-zinc-200 p-1.5 text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
                      title="上移"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMoveDown(section.id, section.order)}
                      disabled={index === sections.length - 1 || isLoading === section.id}
                      className="rounded border border-zinc-200 p-1.5 text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
                      title="下移"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* 啟用/停用按鈕 */}
                  <button
                    onClick={() => handleToggleEnabled(section.id, section.enabled)}
                    disabled={isLoading === section.id}
                    className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                      section.enabled
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {isLoading === section.id ? "處理中..." : section.enabled ? "✓ 啟用" : "停用"}
                  </button>

                  {/* 編輯按鈕 */}
                  <Link
                    href={getEditUrl(section)}
                    className="rounded bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    編輯內容
                  </Link>

                  {/* 刪除按鈕 */}
                  <button
                    onClick={() => handleDelete(section.id, SECTION_TYPE_NAMES[section.type] || section.type)}
                    disabled={isLoading === section.id}
                    className="rounded border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-zinc-200">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="text-sm text-blue-600 hover:underline"
          >
            ← 返回後台首頁
          </Link>
          <div className="text-xs text-zinc-500">
            拖曳排序功能即將推出
          </div>
        </div>
      </div>
    </div>
  );
}
