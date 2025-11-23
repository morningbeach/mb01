// app/admin/test-gallery/components/effects/ParallaxGallery.tsx
"use client";

import { useState, useRef } from "react";
import { ImageOverlay } from "../shared/ImageOverlay";

interface ParallaxGalleryProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
}

export function ParallaxGallery({ images }: ParallaxGalleryProps) {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
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
        className="h-[500px] overflow-y-auto rounded-lg bg-zinc-900"
        onScroll={handleScroll}
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="relative" style={{ height: `${images.length * 400}px` }}>
          {images.map((image, index) => {
            // 計算視差偏移
            const offset = scrollY * 0.3;
            const layerOffset = index * 0.1;
            const finalOffset = offset * (1 + layerOffset);

            return (
              <div
                key={index}
                className="sticky top-0 h-96 overflow-hidden"
                style={{
                  transform: `translateY(${finalOffset}px)`,
                  opacity: 1 - (scrollY / (images.length * 400)) * (index + 1) * 0.3,
                }}
              >
                <div className="relative h-full w-full">
                  <ImageOverlay image={image} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-zinc-500">
        ↓ 向下滾動體驗視差效果 ↓
      </div>
    </div>
  );
}
