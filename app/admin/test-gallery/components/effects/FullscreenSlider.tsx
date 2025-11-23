// app/admin/test-gallery/components/effects/FullscreenSlider.tsx
"use client";

import { useState, useEffect } from "react";
import { GalleryControls } from "../shared/GalleryControls";
import Image from "next/image";

interface FullscreenSliderProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
}

export function FullscreenSlider({ 
  images,
  autoPlaySpeed = 4000,
  showControls = true 
}: FullscreenSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // 自動播放
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlaySpeed);
    return () => clearInterval(timer);
  }, [isPlaying, images.length, autoPlaySpeed]);

  // 鍵盤控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setIsPlaying(false);
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsPlaying(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
        沒有圖片可顯示
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[600px] overflow-hidden rounded-lg bg-black">
        {images.map((image, index) => {
          const isCurrent = index === currentIndex;

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ${
                isCurrent
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-0"
              }`}
              style={{
                pointerEvents: isCurrent ? "auto" : "none",
              }}
            >
              <Image
                src={image.url}
                alt={image.title || image.label || "Gallery image"}
                fill
                className="object-cover"
                priority={index === 0}
              />

              {/* 全屏覆蓋層 */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

              {/* 標題和說明 */}
              {(image.title || image.subtitle) && (
                <div className="absolute inset-x-0 bottom-0 p-12 text-white">
                  {image.title && (
                    <h2 className="mb-4 text-5xl font-bold leading-tight">
                      {image.title}
                    </h2>
                  )}
                  {image.subtitle && (
                    <p className="max-w-2xl text-lg text-zinc-300">
                      {image.subtitle}
                    </p>
                  )}
                </div>
              )}

              {/* 鍵盤提示 */}
              <div className="absolute right-8 top-8 flex gap-2 rounded-lg bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
                <kbd className="rounded bg-white/20 px-2 py-1">←</kbd>
                <kbd className="rounded bg-white/20 px-2 py-1">→</kbd>
                <span>鍵盤控制</span>
              </div>
            </div>
          );
        })}
      </div>

      {showControls && (
        <GalleryControls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onPrev={() =>
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
          }
          onNext={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
          currentIndex={currentIndex}
          totalCount={images.length}
          onDotClick={setCurrentIndex}
        />
      )}
    </div>
  );
}
