-- CreateEnum
CREATE TYPE "HomeSectionType" AS ENUM ('HERO', 'WHY', 'PRODUCTS', 'FACTORY', 'BLOG', 'CTA', 'RICH_TEXT');

-- CreateTable
CREATE TABLE "HomeSection" (
    "id" SERIAL NOT NULL,
    "type" "HomeSectionType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 100,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSection_pkey" PRIMARY KEY ("id")
);
