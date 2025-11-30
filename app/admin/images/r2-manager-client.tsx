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
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  // 記住虛擬建立但尚未有檔案的資料夾路徑（從資料庫讀取）
  const [virtualFolders, setVirtualFolders] = useState<Set<string>>(new Set());
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  // 清理已有實際檔案的虛擬資料夾
  useEffect(() => {
    if (files.length > 0 && virtualFolders.size > 0) {
      const existingFolderPaths = new Set<string>();
      files.forEach(file => {
        // 直接使用 key（不移除前綴）
        const displayKey = file.key;
        const parts = displayKey.split("/");
        // 收集所有路徑
        for (let i = 1; i < parts.length; i++) {
          existingFolderPaths.add(parts.slice(0, i).join("/"));
        }
      });

      // 移除已經有實際檔案的虛擬資料夾
      const pathsToDelete: string[] = [];
      virtualFolders.forEach(vf => {
        if (existingFolderPaths.has(vf)) {
          pathsToDelete.push(vf);
        }
      });

      if (pathsToDelete.length > 0) {
        // 從資料庫刪除
        pathsToDelete.forEach(async (path) => {
          try {
            await fetch("/api/admin/virtual-folders", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path }),
            });
          } catch (error) {
            console.error(`清理虛擬資料夾 ${path} 失敗:`, error);
          }
        });

        // 更新本地狀態
        setVirtualFolders(prev => {
          const newSet = new Set(prev);
          pathsToDelete.forEach(p => newSet.delete(p));
          return newSet;
        });
      }
    }
  }, [files, virtualFolders]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      // 同時載入檔案和虛擬資料夾
      const [filesRes, foldersRes] = await Promise.all([
        fetch("/api/admin/images"),
        fetch("/api/admin/virtual-folders"),
      ]);
      
      const filesData = await filesRes.json();
      const foldersData = await foldersRes.json();
      
      setFiles(filesData.files || []);
      setVirtualFolders(new Set(foldersData.folders || []));
    } catch (error) {
      console.error("載入檔案失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  // 建立資料夾樹狀結構（包含虛擬資料夾）
  const buildFolderTree = (files: R2File[]): FolderNode => {
    const root: FolderNode = {
      name: "",
      path: "",
      files: [],
      subfolders: new Map(),
    };

    // 先處理實際檔案
    files.forEach((file) => {
      // 直接使用 key，不再移除前綴（讓 uploads/, AItrend/ 等都顯示為根目錄資料夾）
      const displayKey = file.key;
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

    // 加入虛擬資料夾
    virtualFolders.forEach((virtualPath) => {
      const parts = virtualPath.split("/");
      let current = root;

      for (let i = 0; i < parts.length; i++) {
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

  // 新增資料夾（虛擬資料夾，透過導覽實現）
  const handleCreateFolder = () => {
    const folderName = newFolderName.trim();
    
    if (!folderName) {
      alert("請輸入資料夾名稱");
      return;
    }

    // 檢查資料夾名稱是否合法（只允許英文、數字、底線、連字號）
    if (!/^[a-zA-Z0-9_-]+$/.test(folderName)) {
      alert("資料夾名稱只能包含英文字母、數字、底線(_)和連字號(-)");
      return;
    }

    // 檢查當前路徑下是否已存在同名資料夾
    if (currentFolder.subfolders.has(folderName)) {
      alert("此資料夾已存在");
      return;
    }

    // 建立完整的虛擬資料夾路徑
    const virtualPath = currentPath.length > 0 
      ? [...currentPath, folderName].join("/")
      : folderName;
    
    // 關閉對話框並清空輸入
    setShowNewFolderDialog(false);
    setNewFolderName("");

    // 儲存到資料庫
    (async () => {
      try {
        const res = await fetch("/api/admin/virtual-folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: virtualPath }),
        });

        if (!res.ok) throw new Error("新增失敗");

        // 更新本地狀態
        setVirtualFolders(prev => new Set([...prev, virtualPath]));
        
        alert(`已建立虛擬資料夾「${folderName}」\n資料夾已同步至資料庫\n上傳檔案到此路徑後，將會實際存在於 R2`);
      } catch (error) {
        console.error("建立虛擬資料夾失敗:", error);
        alert("建立資料夾失敗，請稍後再試");
      }
    })();
  };

  // 複製圖片連結
  const handleCopyUrl = async (url: string, key: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error("複製失敗:", error);
      alert("複製失敗，請手動複製");
    }
  };

  // 上傳檔案
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const MAX_SIZE = 3 * 1024 * 1024; // 3MB
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

    // 驗證檔案
    for (const file of Array.from(fileList)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`檔案 "${file.name}" 不是圖片格式\n僅支援: JPG, PNG, WebP, GIF`);
        e.target.value = "";
        return;
      }
      if (file.size > MAX_SIZE) {
        alert(`檔案 "${file.name}" 過大 (${(file.size / 1024 / 1024).toFixed(2)}MB)\n最大允許 3MB`);
        e.target.value = "";
        return;
      }
    }

    setUploading(true);
    const uploaded: string[] = [];
    const failed: string[] = [];
    const folder = currentPath.join("/");

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgress(`上傳中 (${i + 1}/${fileList.length}): ${file.name}`);

        try {
          const formData = new FormData();
          formData.append("file", file);
          if (folder) {
            formData.append("folder", folder);
          }

          const res = await fetch("/api/admin/upload-image", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || "上傳失敗");
          }

          const data = await res.json();
          
          if (data.ok) {
            uploaded.push(file.name);
            // 顯示壓縮資訊
            if (data.compressionRatio) {
              console.log(`${file.name}: 壓縮率 ${data.compressionRatio}`);
            }
          } else {
            throw new Error("上傳回應異常");
          }
        } catch (error) {
          console.error(`上傳 ${file.name} 失敗:`, error);
          failed.push(file.name);
        }
      }

      if (uploaded.length > 0) {
        alert(`成功上傳 ${uploaded.length} 個檔案${failed.length > 0 ? `\n失敗 ${failed.length} 個` : ""}`);
        await loadFiles();
      } else {
        alert("所有檔案上傳失敗\n請檢查檔案格式和大小");
      }
    } catch (error) {
      console.error("上傳失敗:", error);
      alert("上傳失敗，請稍後再試");
    } finally {
      setUploading(false);
      setUploadProgress("");
      e.target.value = "";
    }
  };

  // 軟刪除資料夾（標記資料夾內所有檔案為已刪除）
  const handleDeleteFolder = async (folderPath: string, folderName: string) => {
    // 取得該資料夾的完整節點
    const tree = buildFolderTree(files);
    let targetFolder = tree;
    const pathParts = folderPath.split("/");
    
    for (const part of pathParts) {
      const next = targetFolder.subfolders.get(part);
      if (!next) break;
      targetFolder = next;
    }

    // 收集該資料夾及所有子資料夾的所有檔案
    const collectAllFiles = (folder: FolderNode): R2File[] => {
      let allFiles = [...folder.files];
      folder.subfolders.forEach(subfolder => {
        allFiles = allFiles.concat(collectAllFiles(subfolder));
      });
      return allFiles;
    };

    const allFiles = collectAllFiles(targetFolder);
    const fileKeys = allFiles.map(f => f.key);

    // 如果是純虛擬資料夾（沒有任何檔案）
    if (fileKeys.length === 0) {
      if (!confirm(`確定要刪除虛擬資料夾「${folderName}」嗎？`)) {
        return;
      }
      
      // 從資料庫刪除
      try {
        const res = await fetch("/api/admin/virtual-folders", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: folderPath }),
        });

        if (!res.ok) throw new Error("刪除失敗");

        // 更新本地狀態
        setVirtualFolders(prev => {
          const newSet = new Set(prev);
          newSet.delete(folderPath);
          return newSet;
        });
        
        alert("已刪除虛擬資料夾");
      } catch (error) {
        console.error("刪除虛擬資料夾失敗:", error);
        alert("刪除失敗，請稍後再試");
      }
      return;
    }

    // 確認刪除
    if (!confirm(`確定要軟刪除資料夾「${folderName}」嗎？\n這將標記 ${fileKeys.length} 個檔案為已刪除`)) {
      return;
    }

    setDeletingFolder(folderPath);

    try {
      const res = await fetch("/api/admin/images/soft-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: fileKeys }),
      });

      if (!res.ok) throw new Error("刪除失敗");

      alert(`已成功軟刪除資料夾「${folderName}」及其中的 ${fileKeys.length} 個檔案`);
      await loadFiles();
    } catch (error) {
      console.error("刪除資料夾失敗:", error);
      alert("刪除資料夾失敗，請稍後再試");
    } finally {
      setDeletingFolder(null);
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

          <div className="h-4 w-px bg-zinc-200" />

          <label className="cursor-pointer rounded bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700">
            {uploading ? uploadProgress : "📋 上傳圖片"}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
          >
            + 新增資料夾
          </button>
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
              <div
                key={folder.path}
                className="group relative flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 hover:bg-zinc-100"
              >
                <button
                  onClick={() => navigateToFolder(folder.name)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="text-2xl">📁</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{folder.name}</div>
                    <div className="text-xs text-zinc-500">
                      {folder.files.length} 個檔案
                    </div>
                  </div>
                </button>
                {!showDeleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.path, folder.name);
                    }}
                    disabled={deletingFolder === folder.path}
                    className="opacity-0 group-hover:opacity-100 rounded bg-red-100 px-2 py-1 text-xs text-red-600 hover:bg-red-200 disabled:opacity-50"
                    title="軟刪除資料夾"
                  >
                    {deletingFolder === folder.path ? "刪除中..." : "🗑️"}
                  </button>
                )}
              </div>
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
              <button
                onClick={() => handleCopyUrl(file.url, file.key)}
                className="absolute right-2 top-2 z-10 rounded bg-white/90 p-1.5 text-xs opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100"
                title="複製圖片連結"
              >
                {copiedKey === file.key ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span>🔗</span>
                )}
              </button>
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
                    {file.isDeleted ? (
                      <span className="text-xs text-red-600">已刪除</span>
                    ) : (
                      <button
                        onClick={() => handleCopyUrl(file.url, file.key)}
                        className="rounded bg-zinc-100 px-2 py-1 text-xs hover:bg-zinc-200"
                        title="複製圖片連結"
                      >
                        {copiedKey === file.key ? "✓ 已複製" : "🔗 複製"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 新增資料夾對話框 */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">新增資料夾</h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm text-zinc-700">
                資料夾名稱
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFolder();
                  } else if (e.key === "Escape") {
                    setShowNewFolderDialog(false);
                    setNewFolderName("");
                  }
                }}
                placeholder="例如: 2024-products"
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <p className="mt-1 text-xs text-zinc-500">
                只能使用英文字母、數字、底線(_)和連字號(-)
              </p>
              {currentPath.length > 0 && (
                <p className="mt-2 text-xs text-zinc-600">
                  將建立在：<span className="font-mono text-blue-600">
                    uploads/{currentPath.join("/")}/
                  </span>
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setNewFolderName("");
                }}
                className="rounded bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200"
              >
                取消
              </button>
              <button
                onClick={handleCreateFolder}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                建立
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
