"use client";

import { useEffect } from "react";
import Image from "next/image";

interface ImageLightboxProps {
  image: any;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export function ImageLightbox({ 
  image, 
  onClose, 
  onNext, 
  onPrev,
  currentIndex,
  totalCount 
}: ImageLightboxProps) {
  // ESC 關閉
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  // 防止背景滾動
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 關閉按鈕 */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110"
        aria-label="關閉"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 圖片計數 */}
      {currentIndex !== undefined && totalCount !== undefined && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md">
          {currentIndex + 1} / {totalCount}
        </div>
      )}

      {/* 上一張按鈕 */}
      {onPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 md:left-8"
          aria-label="上一張"
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* 下一張按鈕 */}
      {onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 md:right-8"
          aria-label="下一張"
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* 圖片容器 */}
      <div 
        className="relative z-10 mx-4 max-h-[90vh] max-w-[90vw] md:mx-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="relative" style={{ maxHeight: "85vh" }}>
            <Image
              src={image.url || "/cdn/placeholder.jpg"}
              alt={image.title || image.label || "Gallery image"}
              width={1920}
              height={1080}
              className="h-auto max-h-[85vh] w-auto max-w-full object-contain"
              priority
            />
          </div>

          {/* 圖片資訊 */}
          {(image.title || image.subtitle || image.link) && (
            <div className="border-t border-zinc-200 bg-white p-6">
              {image.title && (
                <h3 className="mb-2 text-2xl font-bold text-zinc-900">
                  {image.title}
                </h3>
              )}
              {image.subtitle && (
                <p className="mb-3 text-sm text-zinc-600">
                  {image.subtitle}
                </p>
              )}
              {image.link && (
                <a
                  href={image.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <span>開啟連結</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* 鍵盤提示 */}
        <div className="mt-4 flex justify-center gap-4 text-xs text-white/60">
          <span>ESC 關閉</span>
          {onPrev && <span>← 上一張</span>}
          {onNext && <span>→ 下一張</span>}
        </div>
      </div>
    </div>
  );
}
