"use client";

import { useState, useEffect, useRef } from "react";
import { GalleryControls } from "../shared/GalleryControls";
import Image from "next/image";

interface MultiCarouselProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
  height?: string;
  aspectRatio?: string;
  clickMode?: "none" | "link" | "lightbox";
  onImageClick?: (image: any, index: number) => void;
  itemsPerView?: number;
  objectFit?: string;
}

export function MultiCarousel({ 
  images, 
  autoPlaySpeed = 3000,
  enableSwipe = true,
  showControls = true,
  height = "h-96",
  clickMode = "none",
  onImageClick,
  itemsPerView = 3,
  objectFit = "object-contain"
}: MultiCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 計算總頁數
  const totalPages = Math.ceil(images.length / itemsPerView);
  const maxIndex = totalPages - 1;

  // 自動播放
  useEffect(() => {
    if (!isPlaying || totalPages <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalPages);
    }, autoPlaySpeed);
    return () => clearInterval(timer);
  }, [isPlaying, totalPages, autoPlaySpeed]);

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
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else {
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
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
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else {
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
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

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  if (images.length === 0) {
    return (
      <div className={`flex ${height} items-center justify-center rounded-lg bg-zinc-100 text-zinc-500`}>
        沒有圖片可顯示
      </div>
    );
  }

  const itemWidth = `${100 / itemsPerView}%`;

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
              className={`relative h-full flex-shrink-0 px-2 ${clickMode !== "none" ? "cursor-pointer" : ""}`}
              style={{ width: itemWidth }}
              onClick={(e) => handleImageClickEvent(e, image, index)}
            >
              <div className="relative h-full w-full overflow-hidden rounded-lg bg-white shadow-md">
                <Image
                  src={image.url || "/cdn/placeholder.jpg"}
                  alt={image.title || image.label || "Gallery image"}
                  fill
                  className={objectFit}
                  priority={index < itemsPerView}
                  draggable={false}
                />
                
                {/* 標題覆蓋層 */}
                {(image.title || image.subtitle) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                    {image.title && (
                      <h3 className="mb-1 text-lg font-bold line-clamp-1">{image.title}</h3>
                    )}
                    {image.subtitle && (
                      <p className="text-xs text-zinc-200 line-clamp-1">{image.subtitle}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 導航提示 */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {currentIndex < maxIndex && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {showControls && (
        <>
          <GalleryControls
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onPrev={handlePrev}
            onNext={handleNext}
            currentIndex={currentIndex}
            totalCount={totalPages}
            onDotClick={setCurrentIndex}
          />
          <div className="mt-2 text-center text-sm text-zinc-600">
            頁 {currentIndex + 1} / {totalPages} · 每頁 {itemsPerView} 張圖
          </div>
        </>
      )}
    </div>
  );
}
