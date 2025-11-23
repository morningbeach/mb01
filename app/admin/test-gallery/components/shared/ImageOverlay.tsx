// app/admin/test-gallery/components/shared/ImageOverlay.tsx
"use client";

import Image from "next/image";

interface ImageOverlayProps {
  image: any;
  onClick?: () => void;
  className?: string;
}

export function ImageOverlay({ image, onClick, className = "" }: ImageOverlayProps) {
  const handleClick = () => {
    if (!onClick) return;

    switch (image.clickBehavior) {
      case "link":
        if (image.link) {
          window.open(image.link, "_blank");
        }
        break;
      case "detail":
      case "zoom":
        onClick();
        break;
      case "none":
      default:
        // 不執行任何動作
        break;
    }
  };

  const cursorStyle =
    image.clickBehavior !== "none" ? "cursor-pointer" : "cursor-default";

  return (
    <div
      className={`group relative overflow-hidden ${cursorStyle} ${className}`}
      onClick={handleClick}
    >
      <Image
        src={image.url || "/cdn/placeholder.jpg"}
        alt={image.title || image.label || "Gallery image"}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* 文字覆蓋層 */}
      {(image.title || image.subtitle) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {image.title && (
              <h3 className="mb-2 text-2xl font-bold drop-shadow-lg">
                {image.title}
              </h3>
            )}
            {image.subtitle && (
              <p className="text-sm opacity-90 drop-shadow-lg">
                {image.subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 點擊提示 */}
      {image.clickBehavior !== "none" && (
        <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-white/90 p-2 backdrop-blur-sm">
            {image.clickBehavior === "link" && (
              <svg
                className="h-5 w-5 text-zinc-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            )}
            {image.clickBehavior === "zoom" && (
              <svg
                className="h-5 w-5 text-zinc-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                />
              </svg>
            )}
            {image.clickBehavior === "detail" && (
              <svg
                className="h-5 w-5 text-zinc-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
