// lib/image-utils.ts
// 圖片優化工具函數

/**
 * 生成 Cloudflare Image Resizing URL
 * 使用 Cloudflare 的 /cdn-cgi/image/ 端點進行即時圖片轉換
 */
export function getOptimizedImageUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "avif" | "json";
    fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  } = {}
): string {
  // 如果是相對路徑或本地路徑，直接返回
  if (!src || src.startsWith("/") || src.startsWith("data:")) {
    return src;
  }

  // 如果不是我們的 R2 圖床，直接返回原始 URL
  const r2Domain = "img.mbpack.co";
  if (!src.includes(r2Domain)) {
    return src;
  }

  const {
    width,
    height,
    quality = 80,
    format = "auto",
    fit = "cover",
  } = options;

  // 構建 Cloudflare Image Resizing 參數
  const params: string[] = [];
  if (width) params.push(`width=${width}`);
  if (height) params.push(`height=${height}`);
  params.push(`quality=${quality}`);
  params.push(`format=${format}`);
  params.push(`fit=${fit}`);

  // 轉換為 Cloudflare Image Resizing URL
  // 格式: https://your-domain.com/cdn-cgi/image/options/image-url
  const imageOptions = params.join(",");
  
  // 從 R2 URL 提取路徑
  const url = new URL(src);
  const imagePath = url.pathname;
  
  // 返回優化後的 URL
  return `https://${r2Domain}/cdn-cgi/image/${imageOptions}${imagePath}`;
}

/**
 * 預設縮圖尺寸
 */
export const THUMBNAIL_SIZES = {
  xs: { width: 64, height: 64 },
  sm: { width: 150, height: 150 },
  md: { width: 300, height: 300 },
  lg: { width: 600, height: 600 },
  xl: { width: 1200, height: 1200 },
} as const;

/**
 * 獲取縮圖 URL
 */
export function getThumbnailUrl(
  src: string,
  size: keyof typeof THUMBNAIL_SIZES = "md"
): string {
  const dimensions = THUMBNAIL_SIZES[size];
  return getOptimizedImageUrl(src, {
    width: dimensions.width,
    height: dimensions.height,
    quality: size === "xs" || size === "sm" ? 70 : 80,
    format: "auto",
    fit: "cover",
  });
}

/**
 * 獲取響應式圖片 srcSet
 */
export function getResponsiveSrcSet(src: string): string {
  const widths = [320, 640, 768, 1024, 1280, 1920];
  
  return widths
    .map((w) => {
      const optimizedUrl = getOptimizedImageUrl(src, {
        width: w,
        quality: 80,
        format: "auto",
      });
      return `${optimizedUrl} ${w}w`;
    })
    .join(", ");
}

/**
 * 獲取產品圖片的優化 URL
 */
export function getProductImageUrl(
  src: string,
  variant: "thumbnail" | "card" | "gallery" | "hero" = "card"
): string {
  const configs = {
    thumbnail: { width: 100, height: 100, quality: 70 },
    card: { width: 400, height: 400, quality: 80 },
    gallery: { width: 800, height: 800, quality: 85 },
    hero: { width: 1200, height: 800, quality: 90 },
  };

  const config = configs[variant];
  return getOptimizedImageUrl(src, {
    width: config.width,
    height: config.height,
    quality: config.quality,
    format: "auto",
    fit: "cover",
  });
}

/**
 * 圖片載入優先級
 */
export type ImagePriority = "eager" | "lazy";

/**
 * 根據圖片位置決定載入策略
 */
export function getImageLoadingStrategy(index: number): {
  loading: "eager" | "lazy";
  priority: boolean;
} {
  // 前 4 張圖片優先載入
  if (index < 4) {
    return { loading: "eager", priority: true };
  }
  return { loading: "lazy", priority: false };
}

/**
 * 生成 blur placeholder data URL
 * 用於圖片載入時的模糊預覽
 */
export function getBlurPlaceholder(width = 10, height = 10): string {
  // 簡單的灰色 placeholder
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="20"/>
      </filter>
      <rect width="100%" height="100%" fill="#f3f4f6" filter="url(#b)"/>
    </svg>`
  )}`;
}
