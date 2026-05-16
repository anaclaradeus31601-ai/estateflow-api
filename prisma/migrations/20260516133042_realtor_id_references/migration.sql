/*
  Warnings:

  - Made the column `realtorId` on table `Visit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Visit" ALTER COLUMN "realtorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_realtorId_fkey" FOREIGN KEY ("realtorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
