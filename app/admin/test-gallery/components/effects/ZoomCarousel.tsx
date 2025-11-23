// app/admin/test-gallery/components/effects/ZoomCarousel.tsx
"use client";

import { useState, useEffect } from "react";
import { GalleryControls } from "../shared/GalleryControls";
import { ImageOverlay } from "../shared/ImageOverlay";

interface ZoomCarouselProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
}

export function ZoomCarousel({ 
  images,
  autoPlaySpeed = 3000,
  enableSwipe = true,
  showControls = true 
}: ZoomCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoom, setZoom] = useState(true);

  // 自動播放
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;
    const timer = setInterval(() => {
      setZoom(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setZoom(true);
      }, 400);
    }, autoPlaySpeed);
    return () => clearInterval(timer);
  }, [isPlaying, images.length, autoPlaySpeed]);

  const handlePrev = () => {
    setZoom(false);
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setZoom(true);
    }, 400);
  };

  const handleNext = () => {
    setZoom(false);
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setZoom(true);
    }, 400);
  };

  const handleDotClick = (index: number) => {
    setZoom(false);
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setZoom(true);
    }, 400);
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
      <div className="relative h-96 overflow-hidden rounded-lg bg-zinc-100">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ${
              index === currentIndex && zoom
                ? "scale-100 opacity-100"
                : "scale-75 opacity-0"
            }`}
            style={{
              pointerEvents: index === currentIndex ? "auto" : "none",
            }}
          >
            <ImageOverlay image={image} />
          </div>
        ))}
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
    </div>
  );
}
