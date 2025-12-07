/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 啟用 AVIF 和 WebP 格式以獲得更好的壓縮
    formats: ["image/avif", "image/webp"],
    // 定義響應式圖片尺寸
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 最小化快取時間（秒）- 1 年
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
      // 允許 tomorrowtw 圖片
      {
        protocol: "https",
        hostname: "tomorrowtw.com",
      },
      {
        protocol: "https",
        hostname: "www.tomorrowtw.com",
      },
      // R2 圖床
      {
        protocol: "https",
        hostname: "img.mbpack.co",
        pathname: "/**",
      },
      // Google Charts API (for QR codes)
      {
        protocol: "https",
        hostname: "chart.googleapis.com",
      },
      // Placeholder images for testing
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },

  // Cloudflare Pages 優化
  output: "standalone",
  
  // 暫時跳過類型檢查以加快建置（部署時可改用 CI 檢查）
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  experimental: {
    // 確保 sharp 在 serverless 環境中可用
    serverComponentsExternalPackages: ['sharp'],
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.pages.dev", // Cloudflare Pages preview
      ],
    },
  },

  async rewrites() {
    return [
      {
        source: "/api/catalog/facebook.csv",
        destination: "/api/catalog/facebook",
      },
    ];
  },
};

module.exports = nextConfig;
