-- CreateTable
CREATE TABLE "FrontCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "cardTitle" TEXT,
    "cardDescription" TEXT,
    "cardImage" TEXT,
    "baseCategory" "Category",
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrontCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrontCategoryTagGroup" (
    "id" TEXT NOT NULL,
    "frontCategoryId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "tagSlug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrontCategoryTagGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FrontCategory_slug_key" ON "FrontCategory"("slug");

-- AddForeignKey
ALTER TABLE "FrontCategoryTagGroup" ADD CONSTRAINT "FrontCategoryTagGroup_frontCategoryId_fkey" FOREIGN KEY ("frontCategoryId") REFERENCES "FrontCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
