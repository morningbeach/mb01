/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
    ],
  },

  // Cloudflare Pages 優化
  output: "export",
  distDir: "out",
  
  // 暫時跳過類型檢查以加快建置（部署時可改用 CI 檢查）
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.pages.dev", // Cloudflare Pages preview
      ],
    },
  },
};

module.exports = nextConfig;
