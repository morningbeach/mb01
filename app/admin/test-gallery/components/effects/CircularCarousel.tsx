// app/admin/test-gallery/components/effects/CircularCarousel.tsx
"use client";

import { useState, useEffect } from "react";
import { GalleryControls } from "../shared/GalleryControls";
import { ImageOverlay } from "../shared/ImageOverlay";

interface CircularCarouselProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
}

export function CircularCarousel({ 
  images,
  autoPlaySpeed = 3000,
  showControls = true 
}: CircularCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [rotation, setRotation] = useState(0);

  const radius = 350;
  const centerOffset = 250;

  // 自動播放
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, autoPlaySpeed);
    return () => clearInterval(timer);
  }, [isPlaying, images.length, currentIndex, autoPlaySpeed]);

  const handlePrev = () => {
    setIsPlaying(false);
    const angleStep = 360 / images.length;
    setRotation((prev) => prev + angleStep);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setIsPlaying(false);
    const angleStep = 360 / images.length;
    setRotation((prev) => prev - angleStep);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleDotClick = (index: number) => {
    setIsPlaying(false);
    const angleStep = 360 / images.length;
    const diff = index - currentIndex;
    setRotation((prev) => prev - diff * angleStep);
    setCurrentIndex(index);
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
        <div
          className="absolute left-1/2 top-1/2 transition-transform duration-700 ease-out"
          style={{
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {images.map((image, index) => {
            const angle = (360 / images.length) * index;
            const x = radius * Math.cos((angle * Math.PI) / 180);
            const z = radius * Math.sin((angle * Math.PI) / 180);
            const isCurrent = index === currentIndex;

            return (
              <div
                key={index}
                className="absolute transition-all duration-700"
                style={{
                  width: isCurrent ? "320px" : "240px",
                  height: isCurrent ? "240px" : "180px",
                  transform: `
                    translate(-50%, -50%)
                    translateX(${x}px)
                    translateZ(${z}px)
                    rotate(${-rotation}deg)
                  `,
                  left: "50%",
                  top: "50%",
                  opacity: isCurrent ? 1 : 0.4,
                  zIndex: isCurrent ? 10 : 1,
                }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-lg">
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
    </div>
  );
}
