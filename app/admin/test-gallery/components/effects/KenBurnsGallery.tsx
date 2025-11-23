// app/admin/test-gallery/components/effects/KenBurnsGallery.tsx
"use client";

import { useState, useEffect } from "react";
import { GalleryControls } from "../shared/GalleryControls";
import Image from "next/image";

interface KenBurnsGalleryProps {
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

export function KenBurnsGallery({ 
  images,
  autoPlaySpeed = 5000,
  showControls = true,
  height = "h-96",
  clickMode = "none",
  onImageClick,
  objectFit = "object-contain"
}: KenBurnsGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // 自動播放 - Ken Burns 效果需要較長時間
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

  // Ken Burns 動畫變化
  const animations = [
    "scale-110 translate-x-2 translate-y-2",
    "scale-110 -translate-x-2 translate-y-2",
    "scale-110 translate-x-2 -translate-y-2",
    "scale-110 -translate-x-2 -translate-y-2",
  ];

  return (
    <div>
      <div className={`relative ${height} overflow-hidden rounded-lg bg-black`}>
        {images.map((image, index) => {
          const isCurrent = index === currentIndex;
          const animation = animations[index % animations.length];

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isCurrent ? "opacity-100" : "opacity-0"
              } ${clickMode !== "none" ? "cursor-pointer" : ""}`}
              style={{
                pointerEvents: isCurrent ? "auto" : "none",
              }}
              onClick={() => {
                if (clickMode !== "none" && onImageClick && isCurrent) {
                  onImageClick(image, index);
                }
              }}
            >
              <div
                className={`h-full w-full transition-transform duration-[5000ms] ease-linear ${
                  isCurrent ? animation : "scale-100"
                }`}
              >
                <Image
                  src={image.url}
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
            </div>
          );
        })}
      </div>

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

      <div className="mt-4 text-center text-sm text-zinc-500">
        Ken Burns 緩慢縮放平移效果
      </div>
    </div>
  );
}
