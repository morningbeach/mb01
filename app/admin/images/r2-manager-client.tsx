"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type R2File = {
  key: string;
  url: string;
  size: number;
  lastModified: string;
  isDeleted?: boolean;
};

type FolderNode = {
  name: string;
  path: string;
  files: R2File[];
  subfolders: Map<string, FolderNode>;
};

export function R2ManagerClient() {
  const [files, setFiles] = useState<R2File[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/images");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("載入檔案失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  // 建立資料夾樹狀結構
  const buildFolderTree = (files: R2File[]): FolderNode => {
    const root: FolderNode = {
      name: "",
      path: "",
      files: [],
      subfolders: new Map(),
    };

    files.forEach((file) => {
      // 移除 uploads/ 前綴顯示
      const displayKey = file.key.replace(/^uploads\//, "");
      const parts = displayKey.split("/");
      let current = root;

      // 處理資料夾層級
      for (let i = 0; i < parts.length - 1; i++) {
        const folderName = parts[i];
        if (!current.subfolders.has(folderName)) {
          current.subfolders.set(folderName, {
            name: folderName,
            path: parts.slice(0, i + 1).join("/"),
            files: [],
            subfolders: new Map(),
          });
        }
        current = current.subfolders.get(folderName)!;
      }

      // 加入檔案
      current.files.push(file);
    });

    return root;
  };

  // 取得當前路徑的檔案和資料夾
  const getCurrentFolder = (): FolderNode => {
    const tree = buildFolderTree(files);
    let current = tree;
    for (const folder of currentPath) {
      const next = current.subfolders.get(folder);
      if (!next) break;
      current = next;
    }
    return current;
  };

  const currentFolder = getCurrentFolder();
  const displayFiles = showDeleted
    ? currentFolder.files
    : currentFolder.files.filter((f) => !f.isDeleted);

  // 資料夾導覽
  const navigateToFolder = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
    setSelectedKeys(new Set());
  };

  const navigateUp = () => {
    setCurrentPath(currentPath.slice(0, -1));
    setSelectedKeys(new Set());
  };

  const navigateToRoot = () => {
    setCurrentPath([]);
    setSelectedKeys(new Set());
  };

  // 選取功能
  const toggleSelect = (key: string) => {
    const newSet = new Set(selectedKeys);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setSelectedKeys(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedKeys.size === displayFiles.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(displayFiles.map((f) => f.key)));
    }
  };

  // 軟刪除
  const handleSoftDelete = async () => {
    if (selectedKeys.size === 0) {
      alert("請先選擇要刪除的檔案");
      return;
    }

    if (!confirm(`確定要軟刪除選中的 ${selectedKeys.size} 個檔案嗎？`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/images/soft-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: Array.from(selectedKeys) }),
      });

      if (!res.ok) throw new Error("刪除失敗");

      alert("已成功標記為刪除");
      setSelectedKeys(new Set());
      await loadFiles();
    } catch (error) {
      console.error("刪除失敗:", error);
      alert("刪除失敗，請稍後再試");
    }
  };

  // 恢復檔案
  const handleRestore = async () => {
    if (selectedKeys.size === 0) {
      alert("請先選擇要恢復的檔案");
      return;
    }

    try {
      const res = await fetch("/api/admin/images/soft-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: Array.from(selectedKeys) }),
      });

      if (!res.ok) throw new Error("恢復失敗");

      alert("已成功恢復檔案");
      setSelectedKeys(new Set());
      await loadFiles();
    } catch (error) {
      console.error("恢復失敗:", error);
      alert("恢復失敗，請稍後再試");
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-zinc-500">載入中...</div>;
  }

  return (
    <div className="space-y-4">
      {/* 工具列 */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSelectAll}
            className="rounded bg-zinc-100 px-3 py-1.5 text-xs hover:bg-zinc-200"
          >
            {selectedKeys.size === displayFiles.length && displayFiles.length > 0
              ? "取消全選"
              : "全選"}
          </button>
          <span className="text-xs text-zinc-500">
            已選擇 {selectedKeys.size} / {displayFiles.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-zinc-600">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300"
            />
            顯示已刪除
          </label>

          <div className="h-4 w-px bg-zinc-200" />

          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="rounded bg-zinc-100 px-3 py-1.5 text-xs hover:bg-zinc-200"
          >
            {viewMode === "grid" ? "列表" : "網格"}
          </button>

          {showDeleted && selectedKeys.size > 0 && (
            <button
              onClick={handleRestore}
              className="rounded bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700"
            >
              恢復選中
            </button>
          )}

          {!showDeleted && selectedKeys.size > 0 && (
            <button
              onClick={handleSoftDelete}
              className="rounded bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
            >
              刪除選中
            </button>
          )}
        </div>
      </div>

      {/* 麵包屑導覽 */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={navigateToRoot}
          className="text-zinc-600 hover:text-zinc-900"
        >
          根目錄
        </button>
        {currentPath.map((folder, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-zinc-400">/</span>
            <button
              onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
              className="text-zinc-600 hover:text-zinc-900"
            >
              {folder}
            </button>
          </div>
        ))}
        {currentPath.length > 0 && (
          <button
            onClick={navigateUp}
            className="ml-auto text-xs text-zinc-500 hover:text-zinc-700"
          >
            ← 返回上層
          </button>
        )}
      </div>

      {/* 資料夾列表 */}
      {currentFolder.subfolders.size > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-zinc-700">資料夾</h3>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from(currentFolder.subfolders.values()).map((folder) => (
              <button
                key={folder.path}
                onClick={() => navigateToFolder(folder.name)}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-left hover:bg-zinc-100"
              >
                <span className="text-2xl">📁</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{folder.name}</div>
                  <div className="text-xs text-zinc-500">
                    {folder.files.length} 個檔案
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 檔案列表 */}
      {displayFiles.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center text-zinc-500">
          此資料夾沒有檔案
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayFiles.map((file) => (
            <div
              key={file.key}
              className={`group relative rounded-lg border bg-white p-2 ${
                selectedKeys.has(file.key)
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-zinc-200"
              } ${file.isDeleted ? "opacity-50" : ""}`}
            >
              <input
                type="checkbox"
                checked={selectedKeys.has(file.key)}
                onChange={() => toggleSelect(file.key)}
                className="absolute left-2 top-2 z-10 h-4 w-4 rounded border-zinc-300"
              />
              <div className="relative aspect-square overflow-hidden rounded bg-zinc-100">
                <Image
                  src={file.url}
                  alt={file.key.split("/").pop() || ""}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-2 space-y-1">
                <div className="truncate text-xs font-medium">
                  {file.key.split("/").pop()}
                </div>
                <div className="text-xs text-zinc-500">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
                {file.isDeleted && (
                  <div className="text-xs text-red-600">已刪除</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedKeys.size === displayFiles.length &&
                      displayFiles.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-700">
                  檔名
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-700">
                  大小
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-700">
                  修改時間
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-700">
                  狀態
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {displayFiles.map((file) => (
                <tr
                  key={file.key}
                  className={`hover:bg-zinc-50 ${
                    selectedKeys.has(file.key) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedKeys.has(file.key)}
                      onChange={() => toggleSelect(file.key)}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {file.key.split("/").pop()}
                  </td>
                  <td className="px-4 py-2 text-xs text-zinc-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </td>
                  <td className="px-4 py-2 text-xs text-zinc-500">
                    {new Date(file.lastModified).toLocaleString("zh-TW")}
                  </td>
                  <td className="px-4 py-2">
                    {file.isDeleted && (
                      <span className="text-xs text-red-600">已刪除</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
