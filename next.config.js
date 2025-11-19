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
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        // 記得維持現在 Codespaces 的網址
        "literate-acorn-q75pr5wjw34r9q-3000.app.github.dev",
      ],
    },
  },
};

module.exports = nextConfig;
