/*
  Warnings:

  - You are about to drop the column `firstName` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `hungarianPublicationYear` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `isbn13` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `publishedDate` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `publisher` on the `Book` table. All the data in the column will be lost.
  - Added the required column `name` to the `Author` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Author` table without a default value. This is not possible if the table is not empty.
  - Added the required column `biggerCoverPicKey` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smallerCoverPicKey` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Book_isbn13_key";

-- AlterTable
ALTER TABLE "Author" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "biggerProfilePicKey" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "smallerProfilePicKey" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "hungarianPublicationYear",
DROP COLUMN "isbn13",
DROP COLUMN "publishedDate",
DROP COLUMN "publisher",
ADD COLUMN     "approveStatus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "biggerCoverPicKey" TEXT NOT NULL,
ADD COLUMN     "latestPublicationYear" INTEGER,
ADD COLUMN     "originalPublisher" TEXT,
ADD COLUMN     "smallerCoverPicKey" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "authorId" DROP NOT NULL,
ALTER COLUMN "originalPublicationYear" DROP NOT NULL,
ALTER COLUMN "pageNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "biggerProfilePicKey" TEXT,
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "smallerProfilePicKey" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "BookIsbn" (
    "id" TEXT NOT NULL,
    "isbnNumber" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "BookIsbn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookIsbn_isbnNumber_key" ON "BookIsbn"("isbnNumber");

-- AddForeignKey
ALTER TABLE "BookIsbn" ADD CONSTRAINT "BookIsbn_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
