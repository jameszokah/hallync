/*
  Warnings:

  - You are about to drop the column `capacity` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "capacity",
ADD COLUMN     "total_available" INTEGER NOT NULL DEFAULT 0;
