/*
  Warnings:

  - You are about to drop the column `tagSlug` on the `FrontCategoryTagGroup` table. All the data in the column will be lost.
  - Added the required column `tagId` to the `FrontCategoryTagGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FrontCategory" ADD COLUMN     "heroImage" TEXT;

-- AlterTable
ALTER TABLE "FrontCategoryTagGroup" DROP COLUMN "tagSlug",
ADD COLUMN     "tagId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "subtitle" TEXT;

-- AddForeignKey
ALTER TABLE "FrontCategoryTagGroup" ADD CONSTRAINT "FrontCategoryTagGroup_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
