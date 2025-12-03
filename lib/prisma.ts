// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient | undefined 
};

function createPrismaClient() {
  return new PrismaClient({
    log: ["error", "warn"],
    // 連線池配置 - 防止 "Too many connections" 錯誤
    datasourceUrl: process.env.DATABASE_URL,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// 確保連線在 global 中被重用（開發環境 hot reload 時不會重複建立）
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
