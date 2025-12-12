"use client";

import { useState, useEffect, useRef } from "react";

interface ImagePickerProps {
  value?: string;
  onChange?: (url: string) => void;
  multiple?: boolean;
  onMultiChange?: (urls: string[]) => void;
  multiValue?: string[];
  folder?: string;
  uploadFolder?: string;
  showUpload?: boolean;
}

interface ImageRecord {
  id: string;
  url: string;
  filename: string;
}

interface FolderInfo {
  name: string;
  path: string;
  count: number;
}

const PAGE_SIZE = 20;

export default function ImagePicker({
  value,
  onChange,
  multiple = false,
  onMultiChange,
  multiValue = [],
  folder,
  uploadFolder,
  showUpload = false,
}: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>(folder || "");
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>(multiValue);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalImages, setTotalImages] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 同步外部 multiValue
  useEffect(() => {
    setSelectedUrls(multiValue);
  }, [multiValue]);

  // 開啟 Modal 時載入資料夾列表
  useEffect(() => {
    if (isOpen && folders.length === 0 && !folder) {
      loadFolders();
    }
    // 如果指定了 folder，直接載入該資料夾的圖片
    if (isOpen && folder) {
      setCurrentFolder(folder);
      loadImagesForFolder(folder, 1);
    }
  }, [isOpen, folder]);

  // 載入資料夾列表
  const loadFolders = async () => {
    setLoadingFolders(true);
    try {
      const res = await fetch("/api/admin/images/folders");
      if (!res.ok) throw new Error("Failed to fetch folders");
      const data = await res.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error("載入資料夾失敗:", error);
    } finally {
      setLoadingFolders(false);
    }
  };

  // 載入特定資料夾的圖片（分頁）
  const loadImagesForFolder = async (folderPath: string, pageNum: number) => {
    setLoadingImages(true);
    try {
      // folderPath 已經是完整路徑（如 "uploads", "AItrend" 等），直接加上 / 即可
      const prefix = folderPath ? `${folderPath}/` : "";
      const res = await fetch(
        `/api/admin/images?prefix=${encodeURIComponent(prefix)}&page=${pageNum}&limit=${PAGE_SIZE}`
      );
      if (!res.ok) throw new Error("Failed to fetch images");
      const data = await res.json();
      
      const files = data.files || [];
      const newImages: ImageRecord[] = files
        .filter((f: any) => !f.isDeleted)
        .map((file: any) => {
          const parts = file.key.split("/");
          const filename = parts.pop() ?? file.key;
          return {
            id: file.key,
            url: file.url,
            filename,
          };
        });

      if (pageNum === 1) {
        setImages(newImages);
      } else {
        setImages(prev => [...prev, ...newImages]);
      }
      
      setTotalImages(data.total || newImages.length);
      setHasMore(data.hasMore || false);
      setPage(pageNum);
    } catch (error) {
      console.error("載入圖片失敗:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  // 選擇資料夾
  const handleFolderSelect = (folderPath: string) => {
    setCurrentFolder(folderPath);
    setImages([]);
    setPage(1);
    loadImagesForFolder(folderPath, 1);
  };

  // 返回資料夾列表
  const handleBackToFolders = () => {
    setCurrentFolder("");
    setImages([]);
    setPage(1);
  };

  // 上傳圖片
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);
      
      const targetFolder = uploadFolder || currentFolder || folder || "";
      if (targetFolder) {
        formData.append("folder", targetFolder);
      }

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data.url) {
        // 重新載入當前資料夾
        if (currentFolder || folder) {
          loadImagesForFolder(currentFolder || folder || "", 1);
        }
        // 單選模式直接選中
        if (!multiple && onChange) {
          onChange(data.url);
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error("上傳失敗:", error);
      alert("上傳失敗，請重試");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 選擇圖片
  const handleSelect = (url: string) => {
    if (multiple) {
      const newSelected = selectedUrls.includes(url)
        ? selectedUrls.filter((u) => u !== url)
        : [...selectedUrls, url];
      setSelectedUrls(newSelected);
    } else {
      if (onChange) {
        onChange(url);
      }
      setIsOpen(false);
    }
  };

  // 確認多選
  const handleConfirm = () => {
    if (multiple && onMultiChange) {
      onMultiChange(selectedUrls);
    }
    setIsOpen(false);
  };

  // 載入更多
  const handleLoadMore = () => {
    if (!loadingImages && hasMore) {
      loadImagesForFolder(currentFolder, page + 1);
    }
  };

  return (
    <div className="space-y-2">
      {/* 當前選擇預覽 */}
      {!multiple && value && (
        <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-100">
          <img src={value} alt="Selected" className="w-full h-full object-cover" />
        </div>
      )}

      {multiple && selectedUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUrls.slice(0, 6).map((url, idx) => (
            <div key={idx} className="relative w-20 h-20 border rounded-lg overflow-hidden bg-gray-100">
              <img src={url} alt={`Selected ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
          {selectedUrls.length > 6 && (
            <div className="w-20 h-20 border rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
              +{selectedUrls.length - 6}
            </div>
          )}
        </div>
      )}

      {/* 瀏覽按鈕 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        {multiple ? "選擇圖片" : "瀏覽圖床"}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                {currentFolder && !folder && (
                  <button
                    onClick={handleBackToFolders}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    ← 返回
                  </button>
                )}
                <h3 className="text-lg font-semibold">
                  {currentFolder ? `📁 ${currentFolder}` : "選擇資料夾"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {showUpload && currentFolder && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm"
                    >
                      {uploading ? "⏳ 上傳中..." : "📤 上傳"}
                    </button>
                  </>
                )}
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* 顯示資料夾列表 */}
              {!currentFolder && !folder && (
                <>
                  {loadingFolders ? (
                    <div className="text-center py-12 text-gray-500">載入資料夾中...</div>
                  ) : folders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">沒有找到資料夾</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {folders.map((f) => (
                        <button
                          key={f.path}
                          onClick={() => handleFolderSelect(f.path)}
                          className="p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                        >
                          <div className="text-3xl mb-2">📁</div>
                          <div className="font-medium text-gray-800 truncate">{f.name}</div>
                          <div className="text-sm text-gray-500">{f.count} 張圖片</div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* 顯示圖片列表 */}
              {(currentFolder || folder) && (
                <>
                  {loadingImages && images.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">載入圖片中...</div>
                  ) : images.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">此資料夾沒有圖片</div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-500 mb-3">
                        顯示 {images.length} / {totalImages} 張圖片
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {images.map((img) => {
                          const isSelected = multiple
                            ? selectedUrls.includes(img.url)
                            : value === img.url;

                          return (
                            <div
                              key={img.id}
                              onClick={() => handleSelect(img.url)}
                              className={`
                                relative aspect-square border-2 rounded-lg overflow-hidden cursor-pointer
                                transition-all hover:opacity-80
                                ${isSelected ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200"}
                              `}
                            >
                              <img
                                src={img.url}
                                alt={img.filename}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                                  <span className="text-white text-2xl">✓</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* 載入更多按鈕 */}
                      {hasMore && (
                        <div className="text-center mt-4">
                          <button
                            onClick={handleLoadMore}
                            disabled={loadingImages}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                          >
                            {loadingImages ? "載入中..." : `載入更多 (還有 ${totalImages - images.length} 張)`}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer - 多選模式 */}
            {multiple && (
              <div className="p-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-600">已選擇 {selectedUrls.length} 張</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    確定
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
