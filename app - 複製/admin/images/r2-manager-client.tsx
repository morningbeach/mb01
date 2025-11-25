'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

type R2File = {
  key: string;
  url: string;
  size: number;
  lastModified: string;
};

type Folder = {
  name: string;
  prefix: string;
  fileCount: number;
};

type BatchProduct = {
  name: string;
  imageUrl: string;
  tags: string[];
};

type Tab = 'files' | 'products';

export function R2ManagerClient() {
  const [currentFolder, setCurrentFolder] = useState<string>('uploads/');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<R2File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [activeTab, setActiveTab] = useState<Tab>('files');
  const [products, setProducts] = useState<BatchProduct[]>([{ name: '', imageUrl: '', tags: [] }]);
  const [uploadingProducts, setUploadingProducts] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [selectedImageForProduct, setSelectedImageForProduct] = useState<number | null>(null);
  const [uploadToFolder, setUploadToFolder] = useState<string>('');
  const [selectedImageKeys, setSelectedImageKeys] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deletingKeys, setDeletingKeys] = useState<Set<string>>(new Set());

  // 列出目錄中的內容
  const loadFolder = useCallback(async (folder: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/images?prefix=${encodeURIComponent(folder)}`
      );
      const data = await response.json();
      
      console.log('[R2 Manager] API Response:', data);
      console.log('[R2 Manager] Images count:', data.images?.length || 0);
      
      if (data.images) {
        const folderMap = new Map<string, Folder>();
        const fileList: R2File[] = [];

        data.images.forEach((item: any) => {
          const key = item.id || item.key;
          const relPath = key.replace(folder, '');
          const parts = relPath.split('/').filter((p: string) => p);

          if (parts.length > 1) {
            const folderName = parts[0];
            const folderPrefix = folder + folderName + '/';
            if (!folderMap.has(folderName)) {
              folderMap.set(folderName, {
                name: folderName,
                prefix: folderPrefix,
                fileCount: 0,
              });
            }
            folderMap.get(folderName)!.fileCount++;
          } else if (parts.length === 1) {
            fileList.push({
              key,
              url: item.url,
              size: item.size || 0,
              lastModified: item.lastModified || new Date().toISOString(),
            });
          }
        });

        setFolders(Array.from(folderMap.values()));
        setFiles(fileList);
        setCurrentFolder(folder);
      }
    } catch (error) {
      console.error('Failed to load folder:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化加載
  useEffect(() => {
    loadFolder('uploads/');
  }, [loadFolder]);

  // 處理文件選擇
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // 上傳文件
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    const newProgress: { [key: string]: number } = {};
    
    try {
      const targetFolder = uploadToFolder || currentFolder;
      
      for (const file of selectedFiles) {
        newProgress[file.name] = 0;
        setUploadProgress({ ...newProgress });
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', targetFolder);

        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          newProgress[file.name] = 100;
          setUploadProgress({ ...newProgress });
        } else {
          newProgress[file.name] = -1; // 失敗標記
          setUploadProgress({ ...newProgress });
        }
      }

      await loadFolder(currentFolder);
      setSelectedFiles([]);
      setUploadProgress({});
      setUploadToFolder('');
      alert(`成功上傳 ${Object.values(newProgress).filter(v => v === 100).length} 個檔案`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上傳失敗');
    } finally {
      setUploading(false);
    }
  };

  // 批量上傳產品
  const handleUploadProducts = async () => {
    const validProducts = products.filter(p => p.name && p.imageUrl);
    if (validProducts.length === 0) return;

    setUploadingProducts(true);
    try {
      const response = await fetch('/api/admin/products/batch-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: validProducts }),
      });

      const data = await response.json();
      if (data.ok) {
        alert(`成功上傳 ${data.created} 個產品`);
        setProducts([{ name: '', imageUrl: '', tags: [] }]);
      } else {
        alert(`上傳失敗: ${data.error}`);
      }
    } catch (error) {
      console.error('Product upload failed:', error);
      alert('產品上傳失敗');
    } finally {
      setUploadingProducts(false);
    }
  };

  // 添加產品行
  const addProductRow = () => {
    if (products.length < 100) {
      setProducts([...products, { name: '', imageUrl: '', tags: [] }]);
    }
  };

  // 更新產品
  const updateProduct = (index: number, field: keyof BatchProduct, value: any) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  // 刪除產品行
  const removeProductRow = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  // 軟刪除文件（標記為已刪除，但不真正刪除）
  const handleSoftDelete = async (fileKey: string) => {
    if (!confirm('確定要隱藏此文件嗎？（文件不會被真正刪除，只是在前台不顯示）')) {
      return;
    }

    setDeletingKeys(prev => new Set(prev).add(fileKey));
    try {
      const file = files.find(f => f.key === fileKey);
      if (!file) return;

      const response = await fetch('/api/admin/images/soft-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: file.url, 
          storageKey: file.key 
        }),
      });

      if (response.ok) {
        alert('文件已隱藏（軟刪除）');
        await loadFolder(currentFolder);
      } else {
        alert('操作失敗');
      }
    } catch (error) {
      console.error('Soft delete failed:', error);
      alert('操作失敗');
    } finally {
      setDeletingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileKey);
        return newSet;
      });
    }
  };

  // 批次軟刪除
  const handleBatchSoftDelete = async () => {
    if (selectedImageKeys.size === 0) return;
    if (!confirm(`確定要隱藏選中的 ${selectedImageKeys.size} 個文件嗎？`)) {
      return;
    }

    const keysToDelete = Array.from(selectedImageKeys);
    for (const key of keysToDelete) {
      await handleSoftDelete(key);
    }
    setSelectedImageKeys(new Set());
  };

  // 移除選定的文件
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 建立新資料夾
  const handleCreateFolder = async (folderName?: string) => {
    const nameToUse = folderName || newFolderName;
    if (!nameToUse.trim()) return;

    setCreatingFolder(true);
    try {
      // 建立一個虛擬的 .keep 檔案來標記資料夾存在
      const keepFile = new File([''], '.keep', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', keepFile);
      
      // 使用 folder 參數指定資料夾路徑
      const folderPath = currentFolder + nameToUse.trim() + '/';
      formData.append('folder', folderPath);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setNewFolderName('');
        await loadFolder(currentFolder);
        alert('資料夾已建立');
      } else {
        alert('建立資料夾失敗');
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      alert('建立資料夾錯誤');
    } finally {
      setCreatingFolder(false);
    }
  };

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validProductCount = products.filter(p => p.name && p.imageUrl).length;

  return (
    <div className="space-y-6 px-6 pb-6">
      {/* Tab 切換 */}
      <div className="flex gap-2 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'files'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          📁 文件管理
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          📦 批量上傳產品
        </button>
      </div>

      {/* 文件管理 Tab */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          {/* 面包屑導航和上傳按鈕 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              {currentFolder !== 'uploads/' && (
                <button
                  onClick={() => {
                    const parts = currentFolder.split('/').filter(p => p);
                    parts.pop();
                    const parentFolder = parts.length > 0 ? parts.join('/') + '/' : 'uploads/';
                    loadFolder(parentFolder);
                  }}
                  className="px-2 py-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded"
                  title="返回上一層"
                >
                  ← 返回
                </button>
              )}
              <button
                onClick={() => loadFolder('uploads/')}
                className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 px-2 py-1 rounded font-medium"
              >
                📁 Root
              </button>
              {currentFolder !== 'uploads/' && (() => {
                const pathParts = currentFolder.replace('uploads/', '').replace(/\/$/, '').split('/');
                let accumulatedPath = 'uploads/';
                return pathParts.map((part, index) => {
                  accumulatedPath += part + '/';
                  const pathToLoad = accumulatedPath;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-zinc-400">/</span>
                      <button
                        onClick={() => loadFolder(pathToLoad)}
                        className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 px-2 py-1 rounded font-medium"
                      >
                        {part}
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const name = prompt('輸入新資料夾名稱：');
                  if (name && name.trim()) {
                    handleCreateFolder(name.trim());
                  }
                }}
                disabled={creatingFolder}
                className="px-3 py-2 border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50"
                title="建立新資料夾"
              >
                📁+
              </button>
              <button
                onClick={() => loadFolder(currentFolder)}
                className="px-3 py-2 border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
                title="重新整理"
              >
                🔄
              </button>
              <div className="flex border border-zinc-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-zinc-200' : 'hover:bg-zinc-50'}`}
                  title="網格檢視"
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm border-l border-zinc-200 ${viewMode === 'list' ? 'bg-zinc-200' : 'hover:bg-zinc-50'}`}
                  title="列表檢視"
                >
                  ☰
                </button>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                📤 批次上傳
              </button>
              {selectedImageKeys.size > 0 && (
                <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                  已選擇 {selectedImageKeys.size} 個
                </span>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* 選定文件列表 */}
          {selectedFiles.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                待上傳文件 ({selectedFiles.length})
              </h3>
              
              {/* 資料夾選擇器 */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-zinc-700 mb-2">
                  上傳到資料夾：
                </label>
                <div className="flex gap-2">
                  <select
                    value={uploadToFolder}
                    onChange={(e) => setUploadToFolder(e.target.value)}
                    className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                  >
                    <option value="">當前資料夾 ({currentFolder})</option>
                    <option value="uploads/">根目錄 (uploads/)</option>
                    {folders.map(folder => (
                      <option key={folder.prefix} value={folder.prefix}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const name = prompt('輸入新資料夾名稱：');
                      if (name && name.trim()) {
                        setUploadToFolder(`${currentFolder}${name.trim()}/`);
                      }
                    }}
                    className="px-3 py-2 text-xs bg-zinc-200 hover:bg-zinc-300 rounded-lg whitespace-nowrap"
                  >
                    + 新資料夾
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 rounded border border-zinc-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-900 truncate">{file.name}</p>
                      <p className="text-xs text-zinc-500">{formatSize(file.size)}</p>
                      {uploadProgress[file.name] !== undefined && (
                        <div className="w-full bg-zinc-200 rounded h-1 mt-2">
                          <div
                            className={`h-full rounded transition-all ${
                              uploadProgress[file.name] === -1 
                                ? 'bg-red-500' 
                                : 'bg-zinc-900'
                            }`}
                            style={{ 
                              width: uploadProgress[file.name] === -1 
                                ? '100%' 
                                : `${uploadProgress[file.name]}%` 
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {!uploading && uploadProgress[file.name] !== 100 && (
                      <button
                        onClick={() => removeSelectedFile(index)}
                        className="ml-3 text-xs text-red-600 hover:text-red-700 flex-shrink-0"
                      >
                        移除
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                {uploading ? '上傳中...' : `開始上傳到 ${uploadToFolder || currentFolder}`}
              </button>
            </div>
          )}

          {/* 文件夾 */}
          {folders.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">文件夾</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                    placeholder="新資料夾名稱"
                    className="px-2 py-1 border border-zinc-200 rounded text-xs"
                  />
                  <button
                    onClick={() => handleCreateFolder()}
                    disabled={creatingFolder || !newFolderName.trim()}
                    className="px-2 py-1 text-xs bg-zinc-200 hover:bg-zinc-300 rounded disabled:opacity-50"
                  >
                    新建
                  </button>
                </div>
              </div>
              <div className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">
                {folders.map(folder => (
                  <button
                    key={folder.name}
                    onClick={() => loadFolder(folder.prefix)}
                    className="p-3 rounded-lg border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 transition-colors text-left"
                  >
                    <p className="text-sm font-medium text-zinc-900">📁 {folder.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{folder.fileCount} 個文件</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 圖片網格/列表 */}
          {files.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
              <div className="border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">圖片 ({files.length})</h3>
                {selectedImageKeys.size > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const urls = Array.from(selectedImageKeys).map(key => 
                          files.find(f => f.key === key)?.url
                        ).filter(Boolean).join('\n');
                        navigator.clipboard.writeText(urls);
                        alert(`已複製 ${selectedImageKeys.size} 個URL`);
                      }}
                      className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                    >
                      批次複製URL
                    </button>
                    <button
                      onClick={handleBatchSoftDelete}
                      className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
                    >
                      批次隱藏
                    </button>
                    <button
                      onClick={() => setSelectedImageKeys(new Set())}
                      className="px-2 py-1 text-xs bg-zinc-100 hover:bg-zinc-200 rounded"
                    >
                      取消選擇
                    </button>
                  </div>
                )}
              </div>
              
              {viewMode === 'grid' ? (
                <div className="grid gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {files.map(file => {
                    const isSelected = selectedImageKeys.has(file.key);
                    return (
                      <div
                        key={file.key}
                        className={`rounded-lg border overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                          isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-zinc-200'
                        }`}
                        onClick={(e) => {
                          if (e.ctrlKey || e.metaKey) {
                            setSelectedImageKeys(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(file.key)) {
                                newSet.delete(file.key);
                              } else {
                                newSet.add(file.key);
                              }
                              return newSet;
                            });
                          }
                        }}
                      >
                        <div className="aspect-square bg-zinc-100 overflow-hidden relative">
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                              ✓
                            </div>
                          )}
                          <img
                            src={file.url}
                            alt={file.key.split('/').pop()}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22 fill=%22%239ca3af%22%3EImage%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        <div className="p-2 space-y-1">
                          <p className="text-xs text-zinc-600 truncate" title={file.key.split('/').pop()}>
                            {file.key.split('/').pop()}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {formatSize(file.size)} · {new Date(file.lastModified).toLocaleDateString('zh-TW')}
                          </p>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(file.url);
                                alert('URL 已複製！');
                              }}
                              className="flex-1 px-2 py-1 text-[10px] bg-zinc-100 hover:bg-zinc-200 rounded transition-colors"
                            >
                              📋 複製
                            </button>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-1 text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                            >
                              🔗
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSoftDelete(file.key);
                              }}
                              disabled={deletingKeys.has(file.key)}
                              className="px-2 py-1 text-[10px] bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors disabled:opacity-50"
                              title="軟刪除（隱藏）"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="divide-y divide-zinc-200">
                  {files.map(file => {
                    const isSelected = selectedImageKeys.has(file.key);
                    return (
                      <div
                        key={file.key}
                        className={`flex items-center gap-3 p-3 hover:bg-zinc-50 cursor-pointer ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                        onClick={(e) => {
                          if (e.ctrlKey || e.metaKey) {
                            setSelectedImageKeys(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(file.key)) {
                                newSet.delete(file.key);
                              } else {
                                newSet.add(file.key);
                              }
                              return newSet;
                            });
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <div className="w-12 h-12 bg-zinc-100 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={file.url}
                            alt={file.key.split('/').pop()}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-900 truncate">{file.key.split('/').pop()}</p>
                          <p className="text-xs text-zinc-500">
                            {formatSize(file.size)} · {new Date(file.lastModified).toLocaleDateString('zh-TW', { 
                              year: 'numeric', month: '2-digit', day: '2-digit', 
                              hour: '2-digit', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(file.url);
                              alert('URL 已複製！');
                            }}
                            className="px-3 py-1 text-xs bg-zinc-100 hover:bg-zinc-200 rounded"
                          >
                            📋 複製
                          </button>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                          >
                            開啟
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSoftDelete(file.key);
                            }}
                            disabled={deletingKeys.has(file.key)}
                            className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded disabled:opacity-50"
                            title="軟刪除（隱藏）"
                          >
                            🗑️ 隱藏
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="text-center py-8 text-zinc-500">
              加載中...
            </div>
          )}

          {!loading && folders.length === 0 && files.length === 0 && (
            <div className="text-center py-12 rounded-lg border border-zinc-200 bg-zinc-50">
              <div className="text-4xl mb-3">📁</div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">此資料夾是空的</h3>
              <p className="text-sm text-zinc-600 mb-4">
                點擊上方的「批次上傳」按鈕來添加文件
              </p>
            </div>
          )}
        </div>
      )}

      {/* 批量上傳產品 Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">說明</h3>
            <p className="text-xs text-zinc-600">
              最多支持100個產品。需要填寫：產品名稱、圖片URL、標籤（逗號分隔，可選）
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-zinc-900">產品名稱</th>
                    <th className="text-left px-4 py-3 font-medium text-zinc-900">圖片URL</th>
                    <th className="text-left px-4 py-3 font-medium text-zinc-900">標籤</th>
                    <th className="text-right px-4 py-3 font-medium text-zinc-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(index, 'name', e.target.value)}
                          placeholder="產品名稱"
                          className="w-full px-2 py-1 border border-zinc-200 rounded text-xs"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={product.imageUrl}
                            onChange={(e) => updateProduct(index, 'imageUrl', e.target.value)}
                            placeholder="https://..."
                            className="flex-1 px-2 py-1 border border-zinc-200 rounded text-xs"
                          />
                          <button
                            onClick={() => setSelectedImageForProduct(index)}
                            className="px-2 py-1 text-xs bg-zinc-200 hover:bg-zinc-300 rounded whitespace-nowrap"
                          >
                            選圖
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={product.tags.join(', ')}
                          onChange={(e) =>
                            updateProduct(
                              index,
                              'tags',
                              e.target.value.split(',').map(t => t.trim()).filter(t => t)
                            )
                          }
                          placeholder="標籤1, 標籤2"
                          className="w-full px-2 py-1 border border-zinc-200 rounded text-xs"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => removeProductRow(index)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addProductRow}
              disabled={products.length >= 100}
              className="px-4 py-2 border border-zinc-200 text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 transition-colors"
            >
              + 添加行 ({products.length}/100)
            </button>
            <button
              onClick={handleUploadProducts}
              disabled={uploadingProducts || validProductCount === 0}
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              {uploadingProducts ? '上傳中...' : `上傳產品 (${validProductCount})`}
            </button>
          </div>
        </div>
      )}

      {/* 圖片選擇器模態 */}
      {selectedImageForProduct !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">選擇圖片</h3>
              <button
                onClick={() => setSelectedImageForProduct(null)}
                className="text-zinc-600 hover:text-zinc-900 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              {files.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  沒有圖片，請先上傳
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-3 md:grid-cols-4">
                  {files.map(file => (
                    <button
                      key={file.key}
                      onClick={() => {
                        updateProduct(selectedImageForProduct, 'imageUrl', file.url);
                        setSelectedImageForProduct(null);
                      }}
                      className="rounded-lg border border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="aspect-square bg-zinc-100 overflow-hidden">
                        <img
                          src={file.url}
                          alt={file.key.split('/').pop()}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-zinc-600 truncate">
                          {file.key.split('/').pop()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
