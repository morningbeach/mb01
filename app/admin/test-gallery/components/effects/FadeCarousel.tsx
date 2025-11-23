// app/admin/test-gallery/components/effects/FadeCarousel.tsx
"use client";

import { useState, useEffect } from "react";
import { GalleryControls } from "../shared/GalleryControls";
import Image from "next/image";

interface FadeCarouselProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
  height?: string;
  aspectRatio?: string;
  clickMode?: "none" | "link" | "lightbox";
  onImageClick?: (image: any, index: number) => void;
  objectFit?: string;
}

export function FadeCarousel({ 
  images, 
  autoPlaySpeed = 3000,
  enableSwipe = true,
  showControls = true,
  height = "h-96",
  clickMode = "none",
  onImageClick,
  objectFit = "object-contain"
}: FadeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fade, setFade] = useState(true);

  // 自動播放
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setFade(true);
      }, 300);
    }, autoPlaySpeed);
    return () => clearInterval(timer);
  }, [isPlaying, images.length, autoPlaySpeed]);

  const handlePrev = () => {
    setFade(false);
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setFade(true);
    }, 300);
  };

  const handleNext = () => {
    setFade(false);
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setFade(true);
    }, 300);
  };

  const handleDotClick = (index: number) => {
    setFade(false);
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setFade(true);
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
      <div className={`relative ${height} overflow-hidden rounded-lg bg-zinc-100`}>
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex && fade ? "opacity-100" : "opacity-0"
            } ${clickMode !== "none" ? "cursor-pointer" : ""}`}
            style={{
              pointerEvents: index === currentIndex ? "auto" : "none",
            }}
            onClick={() => {
              if (clickMode !== "none" && onImageClick && index === currentIndex) {
                onImageClick(image, index);
              }
            }}
          >
            <Image
              src={image.url || "/cdn/placeholder.jpg"}
              alt={image.title || image.label || "Gallery image"}
              fill
              className={objectFit}
              priority={index === 0}
              draggable={false}
            />
            
            {/* 標題覆蓋層 */}
            {(image.title || image.subtitle) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
                {image.title && (
                  <h3 className="mb-2 text-2xl font-bold">{image.title}</h3>
                )}
                {image.subtitle && (
                  <p className="text-sm text-zinc-200">{image.subtitle}</p>
                )}
              </div>
            )}
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
