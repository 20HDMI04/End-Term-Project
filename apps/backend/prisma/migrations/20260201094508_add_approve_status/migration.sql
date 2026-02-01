/*
  Warnings:

  - A unique constraint covering the columns `[openLibraryId]` on the table `Author` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleBookId]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[openLibraryId]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,authorId]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Book_title_key";

-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "approveStatus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "openLibraryId" TEXT,
ADD COLUMN     "subjects" TEXT,
ADD COLUMN     "topWorks" TEXT;

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "googleBookId" TEXT,
ADD COLUMN     "openLibraryId" TEXT,
ALTER COLUMN "biggerCoverPicKey" DROP NOT NULL,
ALTER COLUMN "smallerCoverPicKey" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Author_openLibraryId_key" ON "Author"("openLibraryId");

-- CreateIndex
CREATE INDEX "Author_name_idx" ON "Author"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Book_googleBookId_key" ON "Book"("googleBookId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_openLibraryId_key" ON "Book"("openLibraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_title_authorId_key" ON "Book"("title", "authorId");
