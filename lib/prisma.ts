// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient | undefined 
};

function createPrismaClient() {
  // 添加連線池參數到 DATABASE_URL
  const connectionLimit = 3; // Vercel serverless 每個函數限制連線數
  const connectionTimeout = 10; // 連線超時 10 秒
  const poolTimeout = 10; // 連線池超時 10 秒
  
  const baseUrl = process.env.DATABASE_URL || '';
  
  // 如果 URL 已經包含參數，使用 & 連接，否則使用 ?
  const separator = baseUrl.includes('?') ? '&' : '?';
  const urlWithParams = `${baseUrl}${separator}connection_limit=${connectionLimit}&connect_timeout=${connectionTimeout}&pool_timeout=${poolTimeout}`;
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: urlWithParams,
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// 確保連線在 global 中被重用（開發環境 hot reload 時不會重複建立）
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown - 確保在 serverless 函數結束時關閉連線
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}
