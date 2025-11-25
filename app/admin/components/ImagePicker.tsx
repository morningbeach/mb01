"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ImagePickerProps {
  value?: string; // 當前選中的圖片 URL
  onChange?: (url: string) => void;
  multiple?: boolean; // 是否多選
  onMultiChange?: (urls: string[]) => void;
  multiValue?: string[]; // 多選的當前值
}

interface ImageRecord {
  id: string;
  url: string;
  alt: string | null;
  title: string | null;
  width: number | null;
  height: number | null;
}

export default function ImagePicker({
  value,
  onChange,
  multiple = false,
  onMultiChange,
  multiValue = [],
}: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>(multiValue);

  // 載入圖片列表
  useEffect(() => {
    if (isOpen && images.length === 0) {
      loadImages();
    }
  }, [isOpen]);

  // 同步外部 multiValue
  useEffect(() => {
    setSelectedUrls(multiValue);
  }, [multiValue]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/images?limit=100");
      if (!res.ok) throw new Error("Failed to fetch images");
      const data = await res.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("載入圖片失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (url: string) => {
    if (multiple) {
      // 多選模式
      const newSelected = selectedUrls.includes(url)
        ? selectedUrls.filter((u) => u !== url)
        : [...selectedUrls, url];
      setSelectedUrls(newSelected);
    } else {
      // 單選模式
      if (onChange) {
        onChange(url);
      }
      setIsOpen(false);
    }
  };

  const handleConfirm = () => {
    if (multiple && onMultiChange) {
      onMultiChange(selectedUrls);
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      {/* 當前選擇預覽 */}
      {!multiple && value && (
        <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
          <Image
            src={value}
            alt="Selected"
            fill
            className="object-cover"
          />
        </div>
      )}

      {multiple && selectedUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUrls.map((url, idx) => (
            <div
              key={idx}
              className="relative w-24 h-24 border rounded-lg overflow-hidden"
            >
              <Image
                src={url}
                alt={`Selected ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
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

      {/* 彈窗 Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[90vw] max-w-4xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {multiple ? "選擇圖片（多選）" : "選擇圖片"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* 圖片網格 */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  載入中...
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  圖床中還沒有圖片
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                          transition-all hover:scale-105
                          ${
                            isSelected
                              ? "border-blue-500 ring-2 ring-blue-300"
                              : "border-gray-200 hover:border-gray-400"
                          }
                        `}
                      >
                        <Image
                          src={img.url}
                          alt={img.alt || img.title || "Image"}
                          fill
                          className="object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {multiple && (
              <div className="p-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  已選擇 {selectedUrls.length} 張圖片
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="button"
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
