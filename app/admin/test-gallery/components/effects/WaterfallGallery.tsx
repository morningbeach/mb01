// app/admin/test-gallery/components/effects/WaterfallGallery.tsx
"use client";

import Image from "next/image";

interface WaterfallGalleryProps {
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

export function WaterfallGallery({ images, objectFit = "object-cover" }: WaterfallGalleryProps) {
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
      <div className="grid grid-cols-1 gap-4 rounded-lg bg-zinc-50 p-4 md:grid-cols-2 lg:grid-cols-3">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-4">
            {column.map((image: any, imageIndex: number) => {
              // 隨機高度
              const heights = [200, 250, 300, 350];
              const height = heights[(columnIndex + imageIndex) % heights.length];
              
              return (
                <div
                  key={imageIndex}
                  className="group relative overflow-hidden rounded-lg bg-zinc-200 shadow-md transition-shadow duration-300 hover:shadow-xl"
                  style={{ height: `${height}px` }}
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
                          <h3 className="text-base font-semibold">{image.title}</h3>
                        )}
                        {image.subtitle && (
                          <p className="mt-1 text-sm opacity-90">{image.subtitle}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

    </div>
  );
}
