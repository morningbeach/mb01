-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "leadTime" TEXT,
ADD COLUMN     "materials" TEXT,
ADD COLUMN     "notesForBuyer" TEXT,
ADD COLUMN     "originCountry" TEXT,
ADD COLUMN     "packagingInfo" TEXT,
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "unit" TEXT;
