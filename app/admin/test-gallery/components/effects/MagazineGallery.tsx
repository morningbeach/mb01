// app/admin/test-gallery/components/effects/MagazineGallery.tsx
"use client";

import Image from "next/image";

interface MagazineGalleryProps {
  images: any[];
  autoPlaySpeed?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
  height?: string;
  aspectRatio?: string;
  clickMode?: "none" | "link" | "lightbox";
  onImageClick?: (image: any, index: number) => void;
  objectFit?: string;
  layout?: "top" | "left" | "right"; // 主圖位置
}

export function MagazineGallery({ 
  images, 
  objectFit = "object-cover",
  layout = "top" 
}: MagazineGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
        沒有圖片可顯示
      </div>
    );
  }

  // 至少需要4張圖片才能展示完整效果
  const [mainImage, ...restImages] = images;
  const gridImages = restImages.slice(0, 6); // 最多顯示6張網格圖片

  // 主圖位置在上方
  if (layout === "top") {
    return (
      <div className="space-y-4 rounded-lg bg-zinc-50 p-4">
        {/* 主圖區域 */}
        <div className="group relative h-96 overflow-hidden rounded-lg bg-zinc-200 shadow-lg">
          <Image
            src={mainImage.url || "/cdn/placeholder.jpg"}
            alt={mainImage.title || mainImage.label || "Featured image"}
            fill
            className={`${objectFit} transition-transform duration-500 group-hover:scale-105`}
            priority
          />
          {(mainImage.title || mainImage.subtitle) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                {mainImage.title && (
                  <h2 className="mb-2 text-3xl font-bold">{mainImage.title}</h2>
                )}
                {mainImage.subtitle && (
                  <p className="text-sm opacity-90">{mainImage.subtitle}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 雜誌風格網格 */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {gridImages.map((image, index) => (
            <div
              key={index}
              className="group relative h-48 overflow-hidden rounded-lg bg-zinc-200 shadow-md transition-shadow duration-300 hover:shadow-xl"
            >
              <Image
                src={image.url || "/cdn/placeholder.jpg"}
                alt={image.title || image.label || "Gallery image"}
                fill
                className={`${objectFit} transition-transform duration-300 group-hover:scale-110`}
              />
              {image.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="text-sm font-semibold">{image.title}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 主圖位置在左側
  if (layout === "left") {
    return (
      <div className="grid gap-4 rounded-lg bg-zinc-50 p-4 md:grid-cols-2">
        {/* 左側主圖 */}
        <div className="group relative h-full min-h-96 overflow-hidden rounded-lg bg-zinc-200 shadow-lg">
          <Image
            src={mainImage.url || "/cdn/placeholder.jpg"}
            alt={mainImage.title || mainImage.label || "Featured image"}
            fill
            className={`${objectFit} transition-transform duration-500 group-hover:scale-105`}
            priority
          />
          {(mainImage.title || mainImage.subtitle) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                {mainImage.title && (
                  <h2 className="mb-2 text-2xl font-bold">{mainImage.title}</h2>
                )}
                {mainImage.subtitle && (
                  <p className="text-sm opacity-90">{mainImage.subtitle}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 右側網格 */}
        <div className="grid grid-cols-2 gap-4">
          {gridImages.map((image, index) => (
            <div
              key={index}
              className="group relative h-44 overflow-hidden rounded-lg bg-zinc-200 shadow-md transition-shadow duration-300 hover:shadow-xl"
            >
              <Image
                src={image.url || "/cdn/placeholder.jpg"}
                alt={image.title || image.label || "Gallery image"}
                fill
                className={`${objectFit} transition-transform duration-300 group-hover:scale-110`}
              />
              {image.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="text-xs font-semibold">{image.title}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 主圖位置在右側
  return (
    <div className="grid gap-4 rounded-lg bg-zinc-50 p-4 md:grid-cols-2">
      {/* 左側網格 */}
      <div className="grid grid-cols-2 gap-4">
        {gridImages.map((image, index) => (
          <div
            key={index}
            className="group relative h-44 overflow-hidden rounded-lg bg-zinc-200 shadow-md transition-shadow duration-300 hover:shadow-xl"
          >
            <Image
              src={image.url || "/cdn/placeholder.jpg"}
              alt={image.title || image.label || "Gallery image"}
              fill
              className={`${objectFit} transition-transform duration-300 group-hover:scale-110`}
            />
            {image.title && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="text-xs font-semibold">{image.title}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 右側主圖 */}
      <div className="group relative h-full min-h-96 overflow-hidden rounded-lg bg-zinc-200 shadow-lg">
        <Image
          src={mainImage.url || "/cdn/placeholder.jpg"}
          alt={mainImage.title || mainImage.label || "Featured image"}
          fill
          className={`${objectFit} transition-transform duration-500 group-hover:scale-105`}
          priority
        />
        {(mainImage.title || mainImage.subtitle) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              {mainImage.title && (
                <h2 className="mb-2 text-2xl font-bold">{mainImage.title}</h2>
              )}
              {mainImage.subtitle && (
                <p className="text-sm opacity-90">{mainImage.subtitle}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
