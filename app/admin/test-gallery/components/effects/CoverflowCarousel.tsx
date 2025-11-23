// app/admin/test-gallery/components/effects/CoverflowCarousel.tsx
"use client";

import { useState, useEffect } from "react";
import { GalleryControls } from "../shared/GalleryControls";
import { ImageOverlay } from "../shared/ImageOverlay";

interface CoverflowCarouselProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
}

export function CoverflowCarousel({
  images,
  autoPlaySpeed = 3000,
  showControls = true,
}: CoverflowCarouselProps) {
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

  if (images.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
        沒有圖片可顯示
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative h-96 overflow-hidden rounded-lg bg-zinc-900"
        style={{ perspective: "1200px" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {images.map((image, index) => {
            const offset = index - currentIndex;
            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);

            // 計算位置和變形
            let translateX = offset * 220;
            let translateZ = isCenter ? 0 : -150 - absOffset * 50;
            let rotateY = offset * 50;
            let opacity = isCenter ? 1 : Math.max(0.3, 1 - absOffset * 0.3);
            let scale = isCenter ? 1 : Math.max(0.6, 1 - absOffset * 0.2);

            // 限制可見範圍
            if (absOffset > 3) {
              opacity = 0;
            }

            return (
              <div
                key={index}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  width: "280px",
                  height: "200px",
                  transform: `
                    translateX(${translateX}px)
                    translateZ(${translateZ}px)
                    rotateY(${rotateY}deg)
                    scale(${scale})
                  `,
                  opacity,
                  transformStyle: "preserve-3d",
                  zIndex: isCenter ? 10 : 5 - absOffset,
                }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-lg shadow-2xl">
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
          onPrev={() =>
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
          }
          onNext={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
          currentIndex={currentIndex}
          totalCount={images.length}
          onDotClick={setCurrentIndex}
        />
      )}

      <div className="mt-4 text-center text-sm text-zinc-500">
        iTunes 風格 Coverflow 效果
      </div>
    </div>
  );
}
