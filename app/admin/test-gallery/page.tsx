"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { GalleryShowcase } from "./components/GalleryShowcase";

const effectsList = [
  { id: "classic", name: "滿版經典橫向", icon: "→", category: "基礎" },
  { id: "multi", name: "多圖橫向輪播", icon: "⋯", category: "基礎" },
  { id: "fade", name: "淡入淡出", icon: "◐", category: "基礎" },
  { id: "kenburns", name: "Ken Burns 電影感", icon: "📹", category: "動態" },
  { id: "fullscreen", name: "全螢幕瀏覽", icon: "⛶", category: "動態" },
  { id: "masonry", name: "Pinterest 瀑布流", icon: "▦", category: "網格" },
  { id: "bento", name: "Bento Box 格子", icon: "⊞", category: "網格" },
  { id: "waterfall", name: "瀑布式展示", icon: "≋", category: "網格" },
  { id: "magazine", name: "雜誌風格", icon: "📰", category: "網格" },
  { id: "minimal", name: "極簡無印風", icon: "◻", category: "進階" },
];

export default function TestGalleryPage() {
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<string>("classic");
  const [albumName, setAlbumName] = useState<string>("");
  const [albumDescription, setAlbumDescription] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  // 載入已存在的相簿
  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const response = await fetch("/api/admin/albums");
      const data = await response.json();
      setAlbums(data.albums || []);
    } catch (error) {
      console.error("Failed to load albums:", error);
    } finally {
      setLoadingAlbums(false);
    }
  };

  const handleUpdateImage = (index: number, updatedImage: any) => {
    setSelectedImages((prev) => {
      const newImages = [...prev];
      newImages[index] = updatedImage;
      return newImages;
    });
  };

  const handleSaveAlbum = async () => {
    if (!albumName.trim()) {
      setSaveMessage({ type: "error", text: "請輸入相簿名稱" });
      return;
    }
    if (selectedImages.length === 0) {
      setSaveMessage({ type: "error", text: "請至少選擇一張圖片" });
      return;
    }

    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/admin/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: albumName,
          description: albumDescription,
          effect: selectedEffect,
          images: selectedImages.map((img, idx) => ({
            imageId: img.id,
            position: idx,
          })),
        }),
      });

      if (!response.ok) throw new Error("儲存失敗");

      const result = await response.json();
      setSaveMessage({ type: "success", text: `相簿「${albumName}」已成功建立！ID: ${result.album.id}` });
      
      // 重新載入相簿列表
      loadAlbums();
      
      // 清空表單
      setTimeout(() => {
        setAlbumName("");
        setAlbumDescription("");
        setSelectedImages([]);
        setSelectedEffect("classic");
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      setSaveMessage({ type: "error", text: "儲存失敗，請稍後再試" });
    } finally {
      setSaving(false);
    }
  };

  // 生成示例圖片用於快速測試
  const generateSampleImages = () => {
    const sampleImages = [
      {
        id: "sample-1",
        url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&auto=format&fit=crop",
        label: "奢華手錶",
        title: "Luxury Watch Collection",
        subtitle: "Premium timepiece packaging design",
      },
      {
        id: "sample-2",
        url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&auto=format&fit=crop",
        label: "化妝品包裝",
        title: "Cosmetic Packaging",
        subtitle: "Elegant beauty product presentation",
      },
      {
        id: "sample-3",
        url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&auto=format&fit=crop",
        label: "葡萄酒禮盒",
        title: "Wine Gift Set",
        subtitle: "Sophisticated wine packaging solution",
      },
      {
        id: "sample-4",
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop",
        label: "科技產品",
        title: "Tech Gadget Box",
        subtitle: "Modern electronics packaging",
      },
      {
        id: "sample-5",
        url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=1200&auto=format&fit=crop",
        label: "巧克力禮盒",
        title: "Chocolate Gift Box",
        subtitle: "Artisan chocolate packaging",
      },
      {
        id: "sample-6",
        url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&auto=format&fit=crop",
        label: "企業禮品",
        title: "Corporate Gift Set",
        subtitle: "Professional business gifting solution",
      },
      {
        id: "sample-7",
        url: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1200&auto=format&fit=crop",
        label: "時尚配飾",
        title: "Fashion Accessories",
        subtitle: "Luxury fashion item packaging",
      },
      {
        id: "sample-8",
        url: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=1200&auto=format&fit=crop",
        label: "香水禮盒",
        title: "Perfume Gift Box",
        subtitle: "Premium fragrance packaging design",
      },
    ];
    setSelectedImages(sampleImages);
  };

  return (
    <div>
      <AdminPageHeader
        title="相簿輪播測試器"
        description="選擇圖片和效果，即時預覽輪播風格"
      />

      <div className="space-y-6">
        {/* 已儲存的相簿列表 */}
        {!loadingAlbums && albums.length > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900">
              已儲存的相簿 ({albums.length})
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => {
                    setAlbumName(album.name);
                    setAlbumDescription(album.description || "");
                    setSelectedEffect("masonry"); // 使用預設效果
                    if (album.items && album.items.length > 0) {
                      setSelectedImages(album.items.map((item: any) => ({
                        id: item.image.storageKey,
                        url: item.image.url,
                        label: item.image.title || item.image.alt || "Image",
                      })));
                    }
                  }}
                  className="group rounded-lg border-2 border-zinc-200 p-4 text-left transition-all hover:border-blue-500 hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="font-medium text-zinc-900 group-hover:text-blue-600">
                      {album.name}
                    </h4>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      {album._count?.items || album.items?.length || 0} 張
                    </span>
                  </div>
                  {album.description && (
                    <p className="text-sm text-zinc-600 line-clamp-2">
                      {album.description}
                    </p>
                  )}
                  {album.coverImage && (
                    <div className="mt-3 aspect-video overflow-hidden rounded-md">
                      <img
                        src={album.coverImage.url}
                        alt={album.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 相簿資訊區 */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">相簿資訊</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                相簿名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder="例如：2024春季新品系列"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                相簿描述
              </label>
              <input
                type="text"
                value={albumDescription}
                onChange={(e) => setAlbumDescription(e.target.value)}
                placeholder="簡短描述這個相簿的內容"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {saveMessage && (
            <div
              className={`mt-4 rounded-lg p-3 text-sm ${
                saveMessage.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveAlbum}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-zinc-400"
            >
              {saving ? "儲存中..." : "💾 儲存為相簿"}
            </button>
          </div>
        </div>

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
            <div className="flex gap-2">
              <button
                onClick={generateSampleImages}
                className="rounded-lg border-2 border-green-500 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
              >
                📦 載入示例圖片 (8張)
              </button>
              <button
                onClick={() => setShowImagePicker(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                從 R2 選擇圖片
              </button>
            </div>
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
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-zinc-900">
              選擇輪播風格（完整 17 種）
            </h3>
            <p className="text-sm text-zinc-600">
              {selectedEffect ? `已選擇: ${effectsList.find(e => e.id === selectedEffect)?.name}` : "請選擇一個風格"}
            </p>
          </div>

          {/* 基礎輪播 */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-zinc-700">📸 基礎輪播</h4>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {effectsList.filter(e => e.category === "基礎").map((effect) => (
                <button
                  key={effect.id}
                  onClick={() => setSelectedEffect(effect.id)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedEffect === effect.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                  }`}
                >
                  <div className="text-3xl mb-2">{effect.icon}</div>
                  <div className="text-sm font-medium text-zinc-900">{effect.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 動態效果 */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-zinc-700">✨ 動態效果</h4>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {effectsList.filter(e => e.category === "動態").map((effect) => (
                <button
                  key={effect.id}
                  onClick={() => setSelectedEffect(effect.id)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedEffect === effect.id
                      ? "border-purple-500 bg-purple-50 shadow-md"
                      : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                  }`}
                >
                  <div className="text-3xl mb-2">{effect.icon}</div>
                  <div className="text-sm font-medium text-zinc-900">{effect.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 網格佈局 */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-zinc-700">🎨 網格佈局</h4>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {effectsList.filter(e => e.category === "網格").map((effect) => (
                <button
                  key={effect.id}
                  onClick={() => setSelectedEffect(effect.id)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedEffect === effect.id
                      ? "border-green-500 bg-green-50 shadow-md"
                      : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                  }`}
                >
                  <div className="text-3xl mb-2">{effect.icon}</div>
                  <div className="text-sm font-medium text-zinc-900">{effect.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3D 特效 */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-zinc-700">🎭 3D 特效</h4>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {effectsList.filter(e => e.category === "3D").map((effect) => (
                <button
                  key={effect.id}
                  onClick={() => setSelectedEffect(effect.id)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedEffect === effect.id
                      ? "border-orange-500 bg-orange-50 shadow-md"
                      : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                  }`}
                >
                  <div className="text-3xl mb-2">{effect.icon}</div>
                  <div className="text-sm font-medium text-zinc-900">{effect.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 進階風格 */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-zinc-700">🌟 進階風格</h4>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {effectsList.filter(e => e.category === "進階").map((effect) => (
                <button
                  key={effect.id}
                  onClick={() => setSelectedEffect(effect.id)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedEffect === effect.id
                      ? "border-pink-500 bg-pink-50 shadow-md"
                      : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                  }`}
                >
                  <div className="text-3xl mb-2">{effect.icon}</div>
                  <div className="text-sm font-medium text-zinc-900">{effect.name}</div>
                </button>
              ))}
            </div>
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
    fetch("/api/admin/images?prefix=uploads/")
      .then((res) => res.json())
      .then((data) => {
        const files = data.files || [];
        // 過濾已刪除並按時間排序
        const sorted = files
          .filter((f: any) => !f.isDeleted)
          .sort((a: any, b: any) => {
            const aTime = a.lastModified ? new Date(a.lastModified).getTime() : 0;
            const bTime = b.lastModified ? new Date(b.lastModified).getTime() : 0;
            return bTime - aTime;
          });
        // 轉換為圖片格式
        const images = sorted.map((file: any) => {
          const parts = file.key.split("/");
          const filename = parts.pop() ?? file.key;
          return {
            id: file.key,
            url: file.url,
            label: filename,
            title: filename,
            subtitle: "",
          };
        });
        setAllImages(images);
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
