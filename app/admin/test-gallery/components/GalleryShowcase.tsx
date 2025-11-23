"use client";

import { useState } from "react";
import { ClassicCarousel } from "./effects/ClassicCarousel";
import { MultiCarousel } from "./effects/MultiCarousel";
import { KenBurnsGallery } from "./effects/KenBurnsGallery";
import { FadeCarousel } from "./effects/FadeCarousel";
import ZoomCarousel from "./effects/ZoomCarousel";
import MasonryGallery from "./effects/MasonryGallery";
import GridAnimationGallery from "./effects/GridAnimationGallery";
import BentoBoxGallery from "./effects/BentoBoxGallery";
import MinimalGallery from "./effects/MinimalGallery";
import { ImageLightbox } from "./shared/ImageLightbox";

interface GalleryShowcaseProps {
  images: any[];
  selectedEffect?: string;
  onUpdateImage?: (index: number, image: any) => void;
}

export function GalleryShowcase({ images, selectedEffect = "classic", onUpdateImage }: GalleryShowcaseProps) {
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(3000);
  const [enableSwipe, setEnableSwipe] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [height, setHeight] = useState("96"); // h-96 = 384px
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [clickMode, setClickMode] = useState<"none" | "link" | "lightbox">("none");
  const [lightboxImage, setLightboxImage] = useState<any | null>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [imageMode, setImageMode] = useState<"contain" | "cover" | "fill" | "none">("contain");

  const effects = [
    { id: "classic", name: "滿版經典橫向", category: "基礎" },
    { id: "multi", name: "多圖橫向輪播", category: "基礎" },
    { id: "fade", name: "淡入淡出", category: "基礎" },
    { id: "kenburns", name: "Ken Burns 電影感", category: "動態" },
    { id: "zoom", name: "縮放進出", category: "動態" },
    { id: "masonry", name: "Pinterest 瀑布流", category: "網格" },
    { id: "grid", name: "網格動畫入場", category: "網格" },
    { id: "bento", name: "Bento Box 格子", category: "網格" },
    { id: "magazine", name: "雜誌排版", category: "網格" },
    { id: "parallax", name: "視差滾動", category: "3D" },
    { id: "carousel3d", name: "3D 旋轉木馬", category: "3D" },
    { id: "cube", name: "立方體翻轉", category: "3D" },
    { id: "stack", name: "卡片堆疊", category: "進階" },
    { id: "minimal", name: "極簡無印風", category: "進階" },
  ];

  const currentEffect = effects.find((e) => e.id === selectedEffect);

  const heightOptions = [
    { value: "64", label: "小 (256px)", class: "h-64" },
    { value: "80", label: "中 (320px)", class: "h-80" },
    { value: "96", label: "大 (384px)", class: "h-96" },
    { value: "screen-60", label: "60% 螢幕", class: "h-[60vh]" },
    { value: "screen-80", label: "80% 螢幕", class: "h-[80vh]" },
  ];

  const aspectRatioOptions = [
    { value: "16:9", label: "16:9 寬螢幕" },
    { value: "4:3", label: "4:3 傳統" },
    { value: "21:9", label: "21:9 超寬" },
    { value: "1:1", label: "1:1 正方形" },
    { value: "9:16", label: "9:16 直式" },
    { value: "auto", label: "自動" },
  ];

  const getHeightClass = () => {
    const option = heightOptions.find((h) => h.value === height);
    return option?.class || "h-96";
  };

  const handleImageClick = (image: any, index: number) => {
    if (clickMode === "lightbox") {
      setLightboxImage({ ...image, index });
    } else if (clickMode === "link" && image.link) {
      window.open(image.link, "_blank");
    }
  };

  const handleLightboxNext = () => {
    if (!lightboxImage) return;
    const nextIndex = (lightboxImage.index + 1) % images.length;
    setLightboxImage({ ...images[nextIndex], index: nextIndex });
  };

  const handleLightboxPrev = () => {
    if (!lightboxImage) return;
    const prevIndex = (lightboxImage.index - 1 + images.length) % images.length;
    setLightboxImage({ ...images[prevIndex], index: prevIndex });
  };

  const getObjectFit = () => {
    switch (imageMode) {
      case "contain":
        return "object-contain"; // 完整顯示，保持比例
      case "cover":
        return "object-cover"; // 填滿容器，保持比例，可能裁切
      case "fill":
        return "object-fill"; // 拉伸填滿，不保持比例
      case "none":
        return "object-none"; // 原始尺寸，不縮放
      default:
        return "object-contain";
    }
  };

  const renderEffect = () => {
    const props = {
      images,
      autoPlaySpeed,
      enableSwipe,
      showControls,
      height: getHeightClass(),
      aspectRatio,
      clickMode,
      onImageClick: handleImageClick,
      objectFit: getObjectFit(),
    };

    switch (selectedEffect) {
      case "classic":
        return <ClassicCarousel {...props} />;
      case "multi":
        return <MultiCarousel {...props} itemsPerView={itemsPerView} />;
      case "kenburns":
        return <KenBurnsGallery {...props} />;
      case "fade":
        return <FadeCarousel {...props} />;
      case "zoom":
        return <ZoomCarousel {...props} />;
      case "masonry":
        return <MasonryGallery {...props} />;
      case "grid":
        return <GridAnimationGallery {...props} />;
      case "bento":
        return <BentoBoxGallery {...props} />;
      case "minimal":
        return <MinimalGallery {...props} />;
      default:
        return <ClassicCarousel {...props} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 設定面板 */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900">
          {currentEffect?.name} - 設定
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* 自動播放速度 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              自動播放速度 (毫秒)
            </label>
            <input
              type="number"
              value={autoPlaySpeed}
              onChange={(e) => setAutoPlaySpeed(Number(e.target.value))}
              step="500"
              min="1000"
              max="10000"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-zinc-500">
              每 {autoPlaySpeed / 1000} 秒切換一次
            </p>
          </div>

          {/* 滑動手勢 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              雙指滑動切換
            </label>
            <button
              onClick={() => setEnableSwipe(!enableSwipe)}
              className={`flex h-10 w-full items-center justify-between rounded-lg border px-4 ${
                enableSwipe
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-zinc-300 bg-zinc-50 text-zinc-500"
              }`}
            >
              <span className="text-sm font-medium">
                {enableSwipe ? "已啟用" : "已停用"}
              </span>
              <div
                className={`h-6 w-11 rounded-full transition-colors ${
                  enableSwipe ? "bg-green-500" : "bg-zinc-300"
                }`}
              >
                <div
                  className={`h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                    enableSwipe ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
            <p className="mt-1 text-xs text-zinc-500">
              觸控板/觸控螢幕滑動控制
            </p>
          </div>

          {/* 顯示控制按鈕 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              顯示控制按鈕
            </label>
            <button
              onClick={() => setShowControls(!showControls)}
              className={`flex h-10 w-full items-center justify-between rounded-lg border px-4 ${
                showControls
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-zinc-300 bg-zinc-50 text-zinc-500"
              }`}
            >
              <span className="text-sm font-medium">
                {showControls ? "顯示" : "隱藏"}
              </span>
              <div
                className={`h-6 w-11 rounded-full transition-colors ${
                  showControls ? "bg-blue-500" : "bg-zinc-300"
                }`}
              >
                <div
                  className={`h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                    showControls ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
            <p className="mt-1 text-xs text-zinc-500">
              播放/暫停、前後按鈕等
            </p>
          </div>

          {/* 輪播高度 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              輪播高度
            </label>
            <select
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {heightOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              適應桌面與手機螢幕
            </p>
          </div>

          {/* 寬高比 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              寬高比
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {aspectRatioOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              圖片裁切比例
            </p>
          </div>

          {/* 點擊行為 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              點擊圖片行為
            </label>
            <select
              value={clickMode}
              onChange={(e) => setClickMode(e.target.value as any)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="none">無動作</option>
              <option value="lightbox">放大查看</option>
              <option value="link">開啟連結（需設定）</option>
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              使用者點擊時的反應
            </p>
          </div>

          {/* 圖片適配模式 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              圖片適配模式
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { 
                  value: "contain", 
                  label: "完整顯示", 
                  icon: "⬜", 
                  desc: "保持比例，完整顯示",
                  borderColor: "border-blue-500",
                  bgColor: "bg-blue-50"
                },
                { 
                  value: "cover", 
                  label: "填滿容器", 
                  icon: "▣", 
                  desc: "保持比例，填滿裁切",
                  borderColor: "border-green-500",
                  bgColor: "bg-green-50"
                },
                { 
                  value: "fill", 
                  label: "拉伸填滿", 
                  icon: "▦", 
                  desc: "不保持比例，可能變形",
                  borderColor: "border-orange-500",
                  bgColor: "bg-orange-50"
                },
                { 
                  value: "none", 
                  label: "原始尺寸", 
                  icon: "◻", 
                  desc: "不縮放，原始大小",
                  borderColor: "border-purple-500",
                  bgColor: "bg-purple-50"
                },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setImageMode(mode.value as any)}
                  className={`group relative overflow-hidden rounded-lg border-2 p-3 text-left transition-all ${
                    imageMode === mode.value
                      ? `${mode.borderColor} ${mode.bgColor}`
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{mode.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-900">
                        {mode.label}
                      </div>
                      <div className="text-xs text-zinc-500 line-clamp-1">
                        {mode.desc}
                      </div>
                    </div>
                  </div>
                  {imageMode === mode.value && (
                    <div className="absolute right-2 top-2">
                      <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 多圖模式 - 每頁顯示數量 */}
          {selectedEffect === "multi" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                每頁顯示數量
              </label>
              <select
                value={itemsPerView}
                onChange={(e) => setItemsPerView(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={1}>1 張</option>
                <option value={2}>2 張</option>
                <option value={3}>3 張</option>
                <option value={4}>4 張</option>
                <option value={5}>5 張</option>
                <option value={6}>6 張</option>
              </select>
              <p className="mt-1 text-xs text-zinc-500">
                單一畫面同時顯示的圖片數
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 圖片清單與編輯 */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900">
          圖片清單 ({images.length} 張)
        </h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {images.map((img, index) => (
            <div
              key={index}
              className="group relative rounded-lg border border-zinc-200 bg-zinc-50 p-3 transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="mb-2 flex items-start gap-3">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                  <img
                    src={img.url}
                    alt={img.label}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {img.title || img.label || `圖片 ${index + 1}`}
                  </p>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {img.subtitle || "無描述"}
                  </p>
                  {img.link && (
                    <a
                      href={img.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <span className="truncate">連結</span>
                      <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => setEditingImageIndex(index)}
                className="w-full rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity hover:bg-blue-700 group-hover:opacity-100"
              >
                編輯設定
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 效果預覽區 */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">效果預覽</h3>
          <div className="text-sm text-zinc-600">
            {images.length} 張圖片 | {currentEffect?.name}
          </div>
        </div>
        <div className="rounded-lg bg-zinc-50 p-4">{renderEffect()}</div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
          onNext={images.length > 1 ? handleLightboxNext : undefined}
          onPrev={images.length > 1 ? handleLightboxPrev : undefined}
          currentIndex={lightboxImage.index}
          totalCount={images.length}
        />
      )}

      {/* 圖片編輯 Modal */}
      {editingImageIndex !== null && (
        <ImageEditorModal
          image={images[editingImageIndex]}
          index={editingImageIndex}
          onClose={() => setEditingImageIndex(null)}
          onSave={(updatedImage) => {
            if (onUpdateImage) {
              onUpdateImage(editingImageIndex, updatedImage);
            }
            setEditingImageIndex(null);
          }}
        />
      )}
    </div>
  );
}

// 圖片編輯器 Modal
function ImageEditorModal({
  image,
  index,
  onClose,
  onSave,
}: {
  image: any;
  index: number;
  onClose: () => void;
  onSave: (image: any) => void;
}) {
  const [title, setTitle] = useState(image.title || "");
  const [subtitle, setSubtitle] = useState(image.subtitle || "");
  const [link, setLink] = useState(image.link || "");

  const handleSave = () => {
    onSave({
      ...image,
      title,
      subtitle,
      link,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 p-6">
          <h2 className="text-xl font-semibold text-zinc-900">
            編輯圖片 #{index + 1}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-zinc-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* 圖片預覽 */}
          <div className="mb-6 overflow-hidden rounded-lg border border-zinc-200">
            <img
              src={image.url}
              alt={image.label}
              className="h-48 w-full object-cover"
            />
          </div>

          <div className="space-y-4">
            {/* 標題 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                標題
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="輸入圖片標題"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 副標題 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                副標題/描述
              </label>
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="輸入圖片描述"
                rows={2}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 連結 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                連結網址
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-zinc-500">
                當點擊行為設定為「開啟連結」時使用
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-200 p-6">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            儲存設定
          </button>
        </div>
      </div>
    </div>
  );
}
