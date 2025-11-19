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
      // ✅ 新增：允許 R2 圖床 img.mbpack.co
      {
        protocol: "https",
        hostname: "img.mbpack.co",
        pathname: "/**",
      },
    ],
  },

  experimental: {
    // ✅ 如果你現在主要在 Codespaces / Cloudflare 上測試
    // 建議先暫時不要限制 allowedOrigins，讓 Next 用相對路徑
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        // 如果未來真的需要指定外部 domain 再加
        // "mbat1.pages.dev",
      ],
    },
  },
};

module.exports = nextConfig;
