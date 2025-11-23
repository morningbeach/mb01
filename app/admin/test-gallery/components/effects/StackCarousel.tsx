// app/admin/test-gallery/components/effects/StackCarousel.tsx
"use client";

import { useState, useEffect } from "react";
import { GalleryControls } from "../shared/GalleryControls";
import { ImageOverlay } from "../shared/ImageOverlay";

interface StackCarouselProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
}

export function StackCarousel({ 
  images,
  autoPlaySpeed = 3000,
  showControls = true 
}: StackCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  // 自動播放
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, autoPlaySpeed);
    return () => clearInterval(timer);
  }, [isPlaying, images.length, currentIndex, autoPlaySpeed]);

  const handlePrev = () => {
    setDirection("right");
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setDirection(null);
    }, 300);
  };

  const handleNext = () => {
    setDirection("left");
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setDirection(null);
    }, 300);
  };

  const handleDotClick = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? "left" : "right");
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setDirection(null);
    }, 300);
  };

  if (images.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
        沒有圖片可顯示
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[500px] overflow-hidden rounded-lg bg-zinc-100">
        <div className="absolute inset-0 flex items-center justify-center">
          {images.map((image, index) => {
            const offset = index - currentIndex;
            const isTop = offset === 0;
            const absOffset = Math.abs(offset);

            // 堆疊效果
            let translateY = absOffset * 8;
            let scale = 1 - absOffset * 0.05;
            let zIndex = images.length - absOffset;
            let opacity = isTop ? 1 : Math.max(0.5, 1 - absOffset * 0.15);

            // 滑動動畫
            let translateX = 0;
            if (direction === "left" && isTop) {
              translateX = -400;
              opacity = 0;
            } else if (direction === "right" && isTop) {
              translateX = 400;
              opacity = 0;
            }

            // 限制可見卡片數量
            if (absOffset > 5) {
              opacity = 0;
              zIndex = 0;
            }

            return (
              <div
                key={index}
                className="absolute transition-all duration-300 ease-out"
                style={{
                  width: "350px",
                  height: "450px",
                  transform: `
                    translateY(${translateY}px)
                    translateX(${translateX}px)
                    scale(${scale})
                  `,
                  opacity,
                  zIndex,
                }}
              >
                <div
                  className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl"
                  style={{
                    boxShadow: isTop
                      ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                      : "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <div className="relative h-full w-full">
                    <ImageOverlay image={image} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showControls && (
        <GalleryControls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onPrev={handlePrev}
          onNext={handleNext}
          currentIndex={currentIndex}
          totalCount={images.length}
          onDotClick={handleDotClick}
        />
      )}

      <div className="mt-4 text-center text-sm text-zinc-500">
        卡片堆疊滑動效果
      </div>
    </div>
  );
}
