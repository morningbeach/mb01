// app/admin/test-gallery/components/effects/WaterfallGallery.tsx
"use client";

import { ImageOverlay } from "../shared/ImageOverlay";

interface WaterfallGalleryProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
}

export function WaterfallGallery({ images }: WaterfallGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
        沒有圖片可顯示
      </div>
    );
  }

  // 分成 3 欄
  const columns = [[], [], []] as any[][];
  images.forEach((img, index) => {
    columns[index % 3].push(img);
  });

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 rounded-lg bg-zinc-50 p-4">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-4">
            {column.map((image: any, imageIndex: number) => {
              // 隨機高度
              const heights = [200, 250, 300, 350];
              const height = heights[(columnIndex + imageIndex) % heights.length];
              
              return (
                <div
                  key={imageIndex}
                  className="relative overflow-hidden rounded-lg"
                  style={{ height: `${height}px` }}
                >
                  <div className="relative h-full w-full">
                    <ImageOverlay image={image} />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 text-center text-sm text-zinc-500">
        Pinterest 風格瀑布流佈局
      </div>
    </div>
  );
}
