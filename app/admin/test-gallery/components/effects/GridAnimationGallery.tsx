// app/admin/test-gallery/components/effects/GridAnimationGallery.tsx
"use client";

import { useState, useEffect } from "react";
import { ImageOverlay } from "../shared/ImageOverlay";

interface GridAnimationGalleryProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
}

export function GridAnimationGallery({
  images,
}: GridAnimationGalleryProps) {
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);

  // 動畫進場效果
  useEffect(() => {
    images.forEach((_, index) => {
      setTimeout(() => {
        setVisibleIndices((prev) => [...prev, index]);
      }, index * 100);
    });

    return () => setVisibleIndices([]);
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
        沒有圖片可顯示
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 p-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => {
          const isVisible = visibleIndices.includes(index);

          return (
            <div
              key={index}
              className={`relative h-48 overflow-hidden rounded-lg transition-all duration-500 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{
                transitionDelay: `${index * 50}ms`,
              }}
            >
              <ImageOverlay image={image} />
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center text-sm text-zinc-500">
        網格動畫進場效果
      </div>
    </div>
  );
}
