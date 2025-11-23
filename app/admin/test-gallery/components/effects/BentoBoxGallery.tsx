"use client";

import { useState } from "react";
import Image from "next/image";

interface BentoBoxGalleryProps {
  images: any[];
  height?: string;
  clickMode?: "none" | "link" | "lightbox";
  onImageClick?: (image: any, index: number) => void;
  objectFit?: string;
}

export default function BentoBoxGallery({
  images,
  height = "700px",
  clickMode = "none",
  onImageClick,
  objectFit = "object-cover",
}: BentoBoxGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleImageClick = (image: any, index: number) => {
    if (clickMode === "lightbox" && onImageClick) {
      onImageClick(image, index);
    } else if (clickMode === "link" && image.link) {
      window.open(image.link, "_blank");
    }
  };

  if (images.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-zinc-100 text-zinc-400"
      >
        請選擇圖片
      </div>
    );
  }

  // Bento Box 佈局模式（Apple 風格）
  const getBentoClass = (index: number) => {
    const pattern = index % 6;
    switch (pattern) {
      case 0:
        return "col-span-2 row-span-2"; // 大方塊
      case 1:
        return "col-span-1 row-span-1"; // 小方塊
      case 2:
        return "col-span-1 row-span-1"; // 小方塊
      case 3:
        return "col-span-1 row-span-2"; // 高長方形
      case 4:
        return "col-span-2 row-span-1"; // 寬長方形
      case 5:
        return "col-span-1 row-span-1"; // 小方塊
      default:
        return "col-span-1 row-span-1";
    }
  };

  return (
    <div
      style={{ height, maxHeight: height }}
      className="overflow-y-auto bg-zinc-50 p-6"
    >
      <div className="grid auto-rows-[200px] grid-cols-3 gap-4 md:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={index}
            className={`group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${getBentoClass(
              index
            )}`}
            onClick={() => handleImageClick(image, index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Image
              src={image.url}
              alt={image.title || ""}
              fill
              className={`${objectFit} transition-all duration-700 group-hover:brightness-105`}
            />

            {/* 精緻疊加（Apple 風格） */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                hoveredIndex === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {image.title && (
                  <h3 className="text-lg font-semibold text-white">
                    {image.title}
                  </h3>
                )}
                {image.subtitle && (
                  <p className="mt-1 text-sm text-white/90">
                    {image.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* 邊框高光效果 */}
            <div
              className={`pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-inset transition-all duration-300 ${
                hoveredIndex === index
                  ? "ring-white/30"
                  : "ring-transparent"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
