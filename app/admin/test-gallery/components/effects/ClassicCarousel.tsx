// app/admin/test-gallery/components/effects/ClassicCarousel.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { GalleryControls } from "../shared/GalleryControls";
import Image from "next/image";

interface ClassicCarouselProps {
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

export function ClassicCarousel({ 
  images, 
  autoPlaySpeed = 3000,
  enableSwipe = true,
  showControls = true,
  height = "h-96",
  clickMode = "none",
  onImageClick,
  objectFit = "object-contain"
}: ClassicCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自動播放
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlaySpeed);
    return () => clearInterval(timer);
  }, [isPlaying, images.length, autoPlaySpeed]);

  // 滑鼠/觸控拖曳
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableSwipe) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setIsPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !enableSwipe) return;
    const diff = e.clientX - startX;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging || !enableSwipe) return;
    setIsDragging(false);

    if (Math.abs(translateX) > 50) {
      if (translateX > 0) {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      } else {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    }
    setTranslateX(0);
  };

  // 觸控事件
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipe) return;
    setTouchStartX(e.touches[0].clientX);
    setStartX(e.touches[0].clientX);
    setIsPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipe || touchStartX === 0) return;
    const diff = e.touches[0].clientX - startX;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!enableSwipe || touchStartX === 0) return;
    
    if (Math.abs(translateX) > 50) {
      if (translateX > 0) {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      } else {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    }
    setTranslateX(0);
    setTouchStartX(0);
  };

  const handleImageClickEvent = (e: React.MouseEvent, image: any, index: number) => {
    if (isDragging || Math.abs(translateX) > 10) return;
    if (clickMode !== "none" && onImageClick) {
      e.stopPropagation();
      onImageClick(image, index);
    }
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
      <div
        ref={containerRef}
        className={`relative ${height} overflow-hidden rounded-lg bg-zinc-100`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative h-full w-full flex-shrink-0 ${clickMode !== "none" ? "cursor-pointer" : ""}`}
              onClick={(e) => handleImageClickEvent(e, image, index)}
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

        {/* 拖曳提示 */}
        {!isDragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
            <div className="rounded-full bg-black/30 p-3 backdrop-blur-sm">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>
            <div className="rounded-full bg-black/30 p-3 backdrop-blur-sm">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        )}
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
