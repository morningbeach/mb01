// app/admin/test-gallery/components/effects/MasonryGallery.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface MasonryGalleryProps {
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

export function MasonryGallery({ 
  images,
  enableSwipe = true,
  objectFit = "object-cover",
}: MasonryGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 拖曳滾動
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !enableSwipe) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current || !enableSwipe) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (images.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
        沒有圖片可顯示
      </div>
    );
  }

  // 隨機高度
  const getRandomHeight = (index: number) => {
    const heights = [250, 300, 350, 400];
    return heights[index % heights.length];
  };

  return (
    <div>
      <div
        ref={containerRef}
        className={`overflow-x-auto rounded-lg bg-zinc-50 p-4 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="flex gap-4" style={{ width: "max-content" }}>
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative shrink-0 overflow-hidden rounded-lg bg-zinc-200 shadow-lg transition-shadow duration-300 hover:shadow-xl"
              style={{
                width: "280px",
                height: `${getRandomHeight(index)}px`,
              }}
            >
              <Image
                src={image.url || "/cdn/placeholder.jpg"}
                alt={image.title || image.label || "Gallery image"}
                fill
                className={`${objectFit} transition-transform duration-300 group-hover:scale-105`}
                draggable={false}
              />
              
              {/* 標題疊加層 */}
              {(image.title || image.subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    {image.title && (
                      <h3 className="text-lg font-semibold">{image.title}</h3>
                    )}
                    {image.subtitle && (
                      <p className="mt-1 text-sm opacity-90">{image.subtitle}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-zinc-500">
        ← 拖曳滾動查看更多 →
      </div>
    </div>
  );
}
