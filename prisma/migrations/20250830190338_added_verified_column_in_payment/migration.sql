/*
  Warnings:

  - You are about to drop the column `schoolPeriodId` on the `StudentDiscount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,discountId,deletedAt]` on the table `StudentDiscount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."StudentDiscount_studentId_discountId_schoolPeriodId_deleted_key";

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "verified" BOOLEAN;

-- AlterTable
ALTER TABLE "public"."StudentDiscount" DROP COLUMN "schoolPeriodId";

-- CreateIndex
CREATE UNIQUE INDEX "StudentDiscount_studentId_discountId_deletedAt_key" ON "public"."StudentDiscount"("studentId", "discountId", "deletedAt");
