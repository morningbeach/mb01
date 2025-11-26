"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProductCardSelectableProps {
  product: any;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  selectionMode: boolean;
}

export function ProductCardSelectable({
  product,
  isSelected,
  onToggleSelect,
  selectionMode,
}: ProductCardSelectableProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`確定要刪除產品「${product.name}」嗎？\n此操作無法復原！`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/products-v2/${product.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "刪除失敗");
      }

      alert("產品已成功刪除");
      router.refresh();
    } catch (error: any) {
      alert(`刪除失敗: ${error.message}`);
      setDeleting(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (selectionMode) {
      e.preventDefault();
      onToggleSelect(product.id);
    }
  };

  const cardContent = (
    <>
      {/* 產品圖片 */}
      {product.coverImage ? (
        <img
          src={product.coverImage}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
        />
      ) : (
        <div className="h-full w-full bg-zinc-100 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-zinc-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* 遮罩資訊 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="text-white font-medium text-sm line-clamp-2 mb-1">
            {product.name}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/80">{product.category}</span>
            {product.status === "ACTIVE" && (
              <span className="inline-flex rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                已發布
              </span>
            )}
            {product.status === "DRAFT" && (
              <span className="inline-flex rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-white">
                草稿
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 狀態角標 */}
      <div className="absolute top-2 right-2">
        {product.status === "ACTIVE" && (
          <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-white"></div>
        )}
        {product.status === "DRAFT" && (
          <div className="w-3 h-3 rounded-full bg-yellow-500 ring-2 ring-white"></div>
        )}
        {product.status === "ARCHIVED" && (
          <div className="w-3 h-3 rounded-full bg-zinc-400 ring-2 ring-white"></div>
        )}
      </div>

      {/* 選擇勾選框 */}
      {selectionMode && (
        <div
          className={`absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            isSelected
              ? "bg-blue-500 border-blue-500"
              : "bg-white/80 border-zinc-300 hover:border-blue-400"
          }`}
        >
          {isSelected && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      )}

      {/* 選中遮罩 */}
      {selectionMode && isSelected && (
        <div className="absolute inset-0 bg-blue-500/20 ring-4 ring-inset ring-blue-500 rounded-xl pointer-events-none"></div>
      )}
    </>
  );

  if (selectionMode) {
    return (
      <div
        onClick={handleClick}
        className={`group relative aspect-square overflow-hidden rounded-xl border-2 bg-white hover:shadow-lg transition-all cursor-pointer ${
          isSelected ? "border-blue-500" : "border-zinc-200"
        }`}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-white hover:shadow-lg transition-all">
      <Link
        href={`/admin/products-v2/${product.id}/edit`}
        className="block h-full"
      >
        {cardContent}
      </Link>

      {/* 刪除按鈕 - 只在非選擇模式顯示 */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-red-500 p-2 text-white hover:bg-red-600 disabled:bg-zinc-400 disabled:cursor-not-allowed"
        title="刪除產品"
      >
        {deleting ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
