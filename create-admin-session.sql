-- 在線上資料庫執行此 SQL 來建立 AdminSession 表

CREATE TABLE IF NOT EXISTS "AdminSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- 建立索引
CREATE UNIQUE INDEX IF NOT EXISTS "AdminSession_sessionId_key" ON "AdminSession"("sessionId");
CREATE INDEX IF NOT EXISTS "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");
CREATE INDEX IF NOT EXISTS "AdminSession_sessionId_idx" ON "AdminSession"("sessionId");

-- 建立外鍵關聯
ALTER TABLE "AdminSession" 
ADD CONSTRAINT "AdminSession_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
