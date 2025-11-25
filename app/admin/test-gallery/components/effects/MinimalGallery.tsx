"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface MinimalGalleryProps {
  images: any[];
  autoPlaySpeed?: number;
  height?: string;
  clickMode?: "none" | "link" | "lightbox";
  onImageClick?: (image: any, index: number) => void;
  objectFit?: string;
}

export default function MinimalGallery({
  images,
  autoPlaySpeed = 6000,
  height = "500px",
  clickMode = "none",
  onImageClick,
  objectFit = "object-contain",
}: MinimalGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fade, setFade] = useState(true);
  const [showControls, setShowControls] = useState(false);

  // 自動播放
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      goToNext();
    }, autoPlaySpeed);
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, autoPlaySpeed]);

  // 淡入淡出
  useEffect(() => {
    setFade(false);
    const timer = setTimeout(() => setFade(true), 100);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageClick = () => {
    if (clickMode === "lightbox" && onImageClick) {
      onImageClick(images[currentIndex], currentIndex);
    } else if (clickMode === "link" && images[currentIndex].link) {
      window.open(images[currentIndex].link, "_blank");
    }
  };

  if (images.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-zinc-50 text-zinc-300">
        請選擇圖片
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div
      className="relative w-full bg-white"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* 極簡容器（MUJI 風格） */}
      <div className="relative overflow-hidden rounded-lg bg-zinc-50" style={{ height }}>
        <div className="relative h-full w-full p-16">
          <div className="relative h-full w-full">
            <Image
              src={currentImage?.url || "/cdn/placeholder.jpg"}
              alt={currentImage?.title || currentImage?.label || "Gallery image"}
              fill
              className={`${objectFit} transition-opacity duration-1000 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
              draggable={false}
              priority
            />
          </div>
        </div>

        {/* 極簡標題（僅文字，無背景） */}
        {currentImage?.title && (
          <div className="absolute inset-x-0 bottom-20 text-center">
            <p className={`font-light tracking-wider text-zinc-400 transition-opacity duration-300 ${
              fade ? "opacity-100" : "opacity-0"
            }`}>
              {currentImage.title}
            </p>
          </div>
        )}
      </div>

      {/* 極簡控制（懸停才顯示） */}
      <div
        className={`absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-6 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* 上一張 */}
        <button
          onClick={goToPrev}
          className="text-zinc-300 transition-colors hover:text-zinc-600"
          aria-label="Previous"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 點點導航 */}
        <div className="flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-8 bg-zinc-400"
                  : "w-1.5 bg-zinc-200 hover:bg-zinc-300"
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>

        {/* 下一張 */}
        <button
          onClick={goToNext}
          className="text-zinc-300 transition-colors hover:text-zinc-600"
          aria-label="Next"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 計數器（右上角，極小） */}
      <div
        className={`absolute right-8 top-8 text-xs font-light tracking-widest text-zinc-300 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {String(currentIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
      </div>
    </div>
  );
}
