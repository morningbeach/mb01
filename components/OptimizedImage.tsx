// components/OptimizedImage.tsx
"use client";

import Image, { ImageProps } from "next/image";
import { useState, useCallback } from "react";
import {
  getOptimizedImageUrl,
  getBlurPlaceholder,
  getImageLoadingStrategy,
} from "@/lib/image-utils";

type OptimizedImageProps = Omit<ImageProps, "src" | "placeholder"> & {
  src: string;
  fallbackSrc?: string;
  optimizeWidth?: number;
  optimizeHeight?: number;
  optimizeQuality?: number;
  index?: number; // 用於決定載入優先級
  enableBlur?: boolean;
};

/**
 * 優化的圖片組件
 * - 自動使用 Cloudflare Image Resizing
 * - 錯誤處理與 fallback
 * - 自動 lazy loading
 * - blur placeholder
 */
export function OptimizedImage({
  src,
  fallbackSrc = "/images/placeholder.jpg",
  optimizeWidth,
  optimizeHeight,
  optimizeQuality = 80,
  index = 999,
  enableBlur = true,
  alt,
  width,
  height,
  fill,
  priority,
  loading,
  className,
  style,
  onError,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // 獲取載入策略
  const loadingStrategy = getImageLoadingStrategy(index);

  // 處理圖片錯誤
  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (!hasError && fallbackSrc) {
        setHasError(true);
        setImgSrc(fallbackSrc);
      }
      onError?.(e);
    },
    [hasError, fallbackSrc, onError]
  );

  // 計算優化後的 URL
  const optimizedSrc = getOptimizedImageUrl(imgSrc, {
    width: optimizeWidth || (typeof width === "number" ? width : undefined),
    height: optimizeHeight || (typeof height === "number" ? height : undefined),
    quality: optimizeQuality,
    format: "auto",
    fit: "cover",
  });

  // 如果是外部 URL 且不是我們的 R2 域名，直接使用原始 URL
  const finalSrc = optimizedSrc || imgSrc;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      priority={priority ?? loadingStrategy.priority}
      loading={loading ?? loadingStrategy.loading}
      className={className}
      style={style}
      onError={handleError}
      placeholder={enableBlur ? "blur" : "empty"}
      blurDataURL={enableBlur ? getBlurPlaceholder() : undefined}
      {...props}
    />
  );
}

/**
 * 產品縮圖組件
 */
export function ProductThumbnail({
  src,
  alt,
  size = "md",
  className,
  ...props
}: {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
} & Omit<OptimizedImageProps, "src" | "alt" | "width" | "height">) {
  const sizes = {
    xs: { width: 64, height: 64 },
    sm: { width: 100, height: 100 },
    md: { width: 200, height: 200 },
    lg: { width: 400, height: 400 },
  };

  const dimensions = sizes[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      optimizeWidth={dimensions.width}
      optimizeHeight={dimensions.height}
      optimizeQuality={size === "xs" ? 60 : 75}
      className={className}
      {...props}
    />
  );
}

/**
 * 產品卡片圖片組件
 */
export function ProductCardImage({
  src,
  alt,
  className,
  index = 999,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  index?: number;
} & Omit<OptimizedImageProps, "src" | "alt" | "fill">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      optimizeWidth={400}
      optimizeHeight={400}
      optimizeQuality={80}
      index={index}
      className={`object-cover ${className || ""}`}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      {...props}
    />
  );
}

/**
 * Hero 圖片組件
 */
export function HeroImage({
  src,
  alt,
  className,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
} & Omit<OptimizedImageProps, "src" | "alt" | "fill">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority
      optimizeWidth={1920}
      optimizeHeight={1080}
      optimizeQuality={85}
      index={0}
      className={`object-cover ${className || ""}`}
      sizes="100vw"
      {...props}
    />
  );
}

/**
 * 畫廊圖片組件
 */
export function GalleryImage({
  src,
  alt,
  className,
  index = 999,
  onClick,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  index?: number;
  onClick?: () => void;
} & Omit<OptimizedImageProps, "src" | "alt" | "fill">) {
  return (
    <div
      className={`relative cursor-pointer ${className || ""}`}
      onClick={onClick}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        optimizeWidth={800}
        optimizeHeight={800}
        optimizeQuality={85}
        index={index}
        className="object-cover transition-transform hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        {...props}
      />
    </div>
  );
}

export default OptimizedImage;
