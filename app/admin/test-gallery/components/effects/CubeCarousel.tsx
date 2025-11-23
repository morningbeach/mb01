// app/admin/test-gallery/components/effects/CubeCarousel.tsx
"use client";

import { useState, useEffect } from "react";
import { GalleryControls } from "../shared/GalleryControls";
import { ImageOverlay } from "../shared/ImageOverlay";

interface CubeCarouselProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
}

export function CubeCarousel({ 
  images,
  autoPlaySpeed = 3000,
  showControls = true 
}: CubeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // 限制最多 4 張圖片（立方體 4 面）
  const displayImages = images.slice(0, 4);

  // 自動播放
  useEffect(() => {
    if (!isPlaying || displayImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, autoPlaySpeed);
    return () => clearInterval(timer);
  }, [isPlaying, displayImages.length, autoPlaySpeed]);

  if (images.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
        沒有圖片可顯示
      </div>
    );
  }

  const getRotation = () => {
    switch (currentIndex) {
      case 0:
        return "rotateY(0deg)";
      case 1:
        return "rotateY(-90deg)";
      case 2:
        return "rotateY(-180deg)";
      case 3:
        return "rotateY(-270deg)";
      default:
        return "rotateY(0deg)";
    }
  };

  return (
    <div>
      <div
        className="relative h-96 overflow-hidden rounded-lg bg-zinc-900"
        style={{ perspective: "1200px" }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-80 w-80 transition-transform duration-700 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `translate(-50%, -50%) ${getRotation()}`,
          }}
        >
          {/* 前面 */}
          {displayImages[0] && (
            <div
              className="absolute h-full w-full overflow-hidden rounded-lg"
              style={{
                transform: "translateZ(200px)",
              }}
            >
              <div className="relative h-full w-full">
                <ImageOverlay image={displayImages[0]} />
              </div>
            </div>
          )}

          {/* 右面 */}
          {displayImages[1] && (
            <div
              className="absolute h-full w-full overflow-hidden rounded-lg"
              style={{
                transform: "rotateY(90deg) translateZ(200px)",
              }}
            >
              <div className="relative h-full w-full">
                <ImageOverlay image={displayImages[1]} />
              </div>
            </div>
          )}

          {/* 背面 */}
          {displayImages[2] && (
            <div
              className="absolute h-full w-full overflow-hidden rounded-lg"
              style={{
                transform: "rotateY(180deg) translateZ(200px)",
              }}
            >
              <div className="relative h-full w-full">
                <ImageOverlay image={displayImages[2]} />
              </div>
            </div>
          )}

          {/* 左面 */}
          {displayImages[3] && (
            <div
              className="absolute h-full w-full overflow-hidden rounded-lg"
              style={{
                transform: "rotateY(270deg) translateZ(200px)",
              }}
            >
              <div className="relative h-full w-full">
                <ImageOverlay image={displayImages[3]} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showControls && (
        <GalleryControls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onPrev={() =>
            setCurrentIndex(
              (prev) => (prev - 1 + displayImages.length) % displayImages.length
            )
          }
          onNext={() =>
            setCurrentIndex((prev) => (prev + 1) % displayImages.length)
          }
          currentIndex={currentIndex}
          totalCount={displayImages.length}
          onDotClick={setCurrentIndex}
        />
      )}

      {images.length > 4 && (
        <div className="mt-4 text-center text-sm text-amber-600">
          ⚠ 立方體效果僅顯示前 4 張圖片
        </div>
      )}
    </div>
  );
}
