"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCardSelectable } from "./ProductCardSelectable";

interface ProductListClientProps {
  products: any[];
}

export function ProductListClient({ products: initialProducts }: ProductListClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // 切換單個產品選擇
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // 全選/取消全選
  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  // 進入選擇模式
  const enterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedIds(new Set());
  };

  // 退出選擇模式
  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setDeletePassword("");
    setDeleteError("");
  };

  // 開啟刪除確認對話框
  const openDeleteModal = () => {
    if (selectedIds.size === 0) {
      alert("請至少選擇一個產品");
      return;
    }
    setShowDeleteModal(true);
    setDeletePassword("");
    setDeleteError("");
  };

  // 確認刪除
  const confirmDelete = async () => {
    const CORRECT_PASSWORD = "35437316";
    
    if (deletePassword !== CORRECT_PASSWORD) {
      setDeleteError("密碼錯誤，請重新輸入");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch("/api/admin/products-v2/batch-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: Array.from(selectedIds) }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "刪除失敗");
      }

      // 從列表中移除已刪除的產品
      setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
      
      alert(`成功刪除 ${selectedIds.size} 個產品`);
      setShowDeleteModal(false);
      exitSelectionMode();
    } catch (error: any) {
      setDeleteError(error.message || "刪除失敗，請稍後再試");
    } finally {
      setDeleting(false);
    }
  };

  // 匯出選定產品
  const exportSelected = async () => {
    if (selectedIds.size === 0) {
      alert("請至少選擇一個產品");
      return;
    }

    setExporting(true);
    try {
      const response = await fetch("/api/admin/products-v2/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: Array.from(selectedIds) }),
      });

      if (!response.ok) {
        throw new Error("匯出失敗");
      }

      // 下載檔案
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      alert(`成功匯出 ${selectedIds.size} 個產品`);
      exitSelectionMode();
    } catch (error) {
      alert("匯出失敗，請稍後再試");
    } finally {
      setExporting(false);
    }
  };

  // 匯出全部產品
  const exportAll = async () => {
    if (products.length === 0) {
      alert("沒有可匯出的產品");
      return;
    }

    setExporting(true);
    try {
      const response = await fetch("/api/admin/products-v2/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exportAll: true }),
      });

      if (!response.ok) {
        throw new Error("匯出失敗");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products_export_all_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      alert(`成功匯出全部 ${products.length} 個產品`);
    } catch (error) {
      alert("匯出失敗，請稍後再試");
    } finally {
      setExporting(false);
    }
  };

  // 下載空白範本
  const downloadTemplate = async () => {
    try {
      const response = await fetch("/api/admin/products-v2/export");

      if (!response.ok) {
        throw new Error("下載失敗");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products_template.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      alert("下載範本失敗");
    }
  };

  return (
    <>
      {/* 工具列 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            V2 新版本
          </span>
          <span className="text-sm text-zinc-500">
            共 {products.length} 個商品
            {selectionMode && selectedIds.size > 0 && (
              <span className="ml-2 text-blue-600">
                （已選 {selectedIds.size} 個）
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 選擇模式控制 */}
          {selectionMode ? (
            <>
              <button
                onClick={toggleSelectAll}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                {selectedIds.size === products.length ? "取消全選" : "全選"}
              </button>
              <button
                onClick={exportSelected}
                disabled={selectedIds.size === 0 || exporting}
                className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {exporting ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    匯出中...
                  </>
                ) : (
                  <>
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    匯出選中 ({selectedIds.size})
                  </>
                )}
              </button>
              <button
                onClick={openDeleteModal}
                disabled={selectedIds.size === 0 || deleting}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
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
                刪除選中 ({selectedIds.size})
              </button>
              <button
                onClick={exitSelectionMode}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                取消
              </button>
            </>
          ) : (
            <>
              {/* 匯出下拉選單 */}
              <div className="relative group">
                <button className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 flex items-center gap-1">
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  匯出
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="absolute right-0 mt-1 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={enterSelectionMode}
                    className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 rounded-t-lg"
                  >
                    📋 選擇產品匯出
                  </button>
                  <button
                    onClick={exportAll}
                    disabled={exporting || products.length === 0}
                    className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                  >
                    📦 匯出全部產品
                  </button>
                  <hr className="border-zinc-200" />
                  <button
                    onClick={downloadTemplate}
                    className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 rounded-b-lg"
                  >
                    📄 下載空白範本
                  </button>
                </div>
              </div>

              <Link
                href="/admin/products-v2/new"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                + 新增商品
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 選擇模式提示 */}
      {selectionMode && (
        <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
          📋 選擇模式：點擊產品卡片來選取，完成後點擊「匯出選中」按鈕
        </div>
      )}

      {/* 商品網格 */}
      {products.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <h3 className="text-lg font-semibold text-zinc-900">
            尚無 V2 版本商品
          </h3>
          <p className="mt-2 text-sm text-zinc-600">
            開始建立新版本的商品，使用優化的框架和更清晰的分類邏輯
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/admin/products-v2/new"
              className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              建立第一個 V2 商品
            </Link>
            <button
              onClick={downloadTemplate}
              className="inline-flex rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              下載 CSV 範本
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCardSelectable
              key={product.id}
              product={product}
              isSelected={selectedIds.has(product.id)}
              onToggleSelect={toggleSelect}
              selectionMode={selectionMode}
            />
          ))}
        </div>
      )}

      {/* 刪除確認對話框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold">確認刪除</h3>
            </div>
            
            <p className="text-zinc-600 mb-4">
              您即將刪除 <span className="font-bold text-red-600">{selectedIds.size}</span> 個產品。
              此操作無法復原，請輸入密碼確認。
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                請輸入確認密碼
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmDelete()}
                placeholder="輸入密碼..."
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                autoFocus
              />
              {deleteError && (
                <p className="mt-2 text-sm text-red-600">{deleteError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting || !deletePassword}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    刪除中...
                  </>
                ) : (
                  "確認刪除"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
