"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { GalleryShowcase } from "./components/GalleryShowcase";

export default function TestGalleryPage() {
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<string>("classic");

  const handleUpdateImage = (index: number, updatedImage: any) => {
    setSelectedImages((prev) => {
      const newImages = [...prev];
      newImages[index] = updatedImage;
      return newImages;
    });
  };

  return (
    <div>
      <AdminPageHeader
        title="相簿輪播測試器"
        description="選擇圖片和效果，即時預覽輪播風格"
      />

      <div className="space-y-6">
        {/* 圖片選擇區 */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                選擇圖片
              </h3>
              <p className="text-sm text-zinc-600">
                已選擇 {selectedImages.length} 張
              </p>
            </div>
            <button
              onClick={() => setShowImagePicker(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              從 R2 選擇圖片
            </button>
          </div>

          {selectedImages.length > 0 && (
            <div className="grid grid-cols-6 gap-2">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200">
                  <img
                    src={img.url}
                    alt={img.label}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() =>
                      setSelectedImages((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 風格選擇區 */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-zinc-900">
              選擇輪播風格（目前測試4種）
            </h3>
            <p className="text-sm text-zinc-600">
              {selectedEffect ? `已選擇: ${selectedEffect}` : "請選擇一個風格"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { id: "classic", name: "滿版經典橫向", icon: "→" },
              { id: "multi", name: "多圖橫向", icon: "⋯" },
              { id: "kenburns", name: "Ken Burns", icon: "📹" },
              { id: "fade", name: "淡入淡出", icon: "◐" },
            ].map((effect) => (
              <button
                key={effect.id}
                onClick={() => setSelectedEffect(effect.id)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  selectedEffect === effect.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="text-3xl mb-2">{effect.icon}</div>
                <div className="text-sm font-medium">{effect.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 輪播展示區 - 即時預覽 */}
        {selectedImages.length > 0 && selectedEffect && (
          <GalleryShowcase 
            images={selectedImages} 
            selectedEffect={selectedEffect}
            onUpdateImage={handleUpdateImage}
          />
        )}

        {selectedImages.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-sm text-zinc-600">
              點擊上方按鈕從 R2 選擇圖片開始測試
            </p>
          </div>
        )}
      </div>

      {/* R2 圖片選擇器 Modal */}
      {showImagePicker && (
        <ImagePickerModal
          onClose={() => setShowImagePicker(false)}
          onSelect={(images) => {
            setSelectedImages(images);
            setShowImagePicker(false);
          }}
          currentSelection={selectedImages}
        />
      )}
    </div>
  );
}

// R2 圖片選擇器元件
function ImagePickerModal({
  onClose,
  onSelect,
  currentSelection,
}: {
  onClose: () => void;
  onSelect: (images: any[]) => void;
  currentSelection: any[];
}) {
  const [allImages, setAllImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any[]>(currentSelection);

  useEffect(() => {
    fetch("/api/images")
      .then((res) => res.json())
      .then((data) => {
        setAllImages(data.images || []);
        setLoading(false);
      });
  }, []);

  const toggleImage = (img: any) => {
    setSelected((prev) => {
      const exists = prev.find((i) => i.id === img.id);
      if (exists) {
        return prev.filter((i) => i.id !== img.id);
      }
      return [...prev, img];
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 p-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              選擇 R2 圖片
            </h2>
            <p className="text-sm text-zinc-600">
              已選擇 {selected.length} 張
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-zinc-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {allImages.map((img) => {
                const isSelected = selected.find((i) => i.id === img.id);
                return (
                  <button
                    key={img.id}
                    onClick={() => toggleImage(img)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      className="h-full w-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                        <div className="rounded-full bg-blue-500 p-1">
                          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-200 p-6">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            取消
          </button>
          <button
            onClick={() => onSelect(selected)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            確認選擇 ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}
