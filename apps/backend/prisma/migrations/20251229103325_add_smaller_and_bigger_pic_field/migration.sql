/*
  Warnings:

  - You are about to drop the column `pictureUrl` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `profilePic` on the `User` table. All the data in the column will be lost.
  - Added the required column `biggerCoverPic` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smallerCoverPic` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Author" DROP COLUMN "pictureUrl",
ADD COLUMN     "biggerProfilePic" TEXT,
ADD COLUMN     "smallerProfilePic" TEXT;

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "picture",
ADD COLUMN     "biggerCoverPic" TEXT NOT NULL,
ADD COLUMN     "smallerCoverPic" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profilePic",
ADD COLUMN     "biggerProfilePic" TEXT,
ADD COLUMN     "smallerProfilePic" TEXT;
