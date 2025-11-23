// app/admin/test-gallery/components/effects/FlipCarousel.tsx
"use client";

import { useState, useEffect } from "react";
import { GalleryControls } from "../shared/GalleryControls";
import { ImageOverlay } from "../shared/ImageOverlay";

interface FlipCarouselProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
}

export function FlipCarousel({ 
  images,
  autoPlaySpeed = 3000,
  showControls = true 
}: FlipCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  // 自動播放
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, autoPlaySpeed);
    return () => clearInterval(timer);
  }, [isPlaying, images.length, currentIndex, autoPlaySpeed]);

  const handlePrev = () => {
    setIsFlipping(true);
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setIsFlipping(false);
    }, 600);
  };

  const handleNext = () => {
    setIsFlipping(true);
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setIsFlipping(false);
    }, 600);
  };

  const handleDotClick = (index: number) => {
    if (index === currentIndex) return;
    setIsFlipping(true);
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsFlipping(false);
    }, 600);
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
      <div className="perspective-1000 relative h-96 overflow-hidden rounded-lg bg-zinc-100">
        <div
          className={`relative h-full w-full transition-transform duration-600 ${
            isFlipping ? "rotate-y-90" : "rotate-y-0"
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipping ? "rotateY(90deg)" : "rotateY(0deg)",
          }}
        >
          <div className="relative h-full w-full">
            <ImageOverlay image={images[currentIndex]} />
          </div>
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

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-0 {
          transform: rotateY(0deg);
        }
        .rotate-y-90 {
          transform: rotateY(90deg);
        }
      `}</style>
    </div>
  );
}
