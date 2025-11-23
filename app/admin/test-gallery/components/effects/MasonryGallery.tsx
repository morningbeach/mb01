// app/admin/test-gallery/components/effects/MasonryGallery.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { ImageOverlay } from "../shared/ImageOverlay";

interface MasonryGalleryProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
}

export function MasonryGallery({ 
  images,
  enableSwipe = true 
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
              className="relative shrink-0 overflow-hidden rounded-lg"
              style={{
                width: "280px",
                height: `${getRandomHeight(index)}px`,
              }}
            >
              <div className="relative h-full w-full">
                <ImageOverlay image={image} />
              </div>
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
