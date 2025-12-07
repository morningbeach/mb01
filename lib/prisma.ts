// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient | undefined 
};

function createPrismaClient() {
  return new PrismaClient({
    log: ["error", "warn"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // 連線池配置 - 防止 "Too many connections" 錯誤
    // Supabase 免費方案連線限制較低，需要控制連線數
  }).$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = Date.now();
        const result = await query(args);
        const duration = Date.now() - start;
        
        // 記錄慢查詢
        if (duration > 1000) {
          console.warn(`[Prisma] Slow query: ${model}.${operation} took ${duration}ms`);
        }
        
        return result;
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// 確保連線在 global 中被重用（開發環境 hot reload 時不會重複建立）
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
