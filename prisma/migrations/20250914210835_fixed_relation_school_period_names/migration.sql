/*
  Warnings:

  - You are about to drop the column `schoolPeriodId` on the `MonthlyFeeOnGrade` table. All the data in the column will be lost.
  - You are about to drop the column `schoolPeriodId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `schoolPeriodId` on the `StudentPeriodDiscount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[monthlyFeeId,gradeId,schoolMonthId,deletedAt]` on the table `MonthlyFeeOnGrade` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[discountId,studentId,schoolMonthId,deletedAt]` on the table `StudentPeriodDiscount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `schoolMonthId` to the `MonthlyFeeOnGrade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolMonthId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolMonthId` to the `StudentPeriodDiscount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."MonthlyFeeOnGrade" DROP CONSTRAINT "MonthlyFeeOnGrade_schoolPeriodId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_schoolPeriodId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudentPeriodDiscount" DROP CONSTRAINT "StudentPeriodDiscount_schoolPeriodId_fkey";

-- DropIndex
DROP INDEX "public"."MonthlyFeeOnGrade_monthlyFeeId_gradeId_schoolPeriodId_delet_key";

-- DropIndex
DROP INDEX "public"."MonthlyFeeOnGrade_monthlyFeeId_gradeId_schoolPeriodId_idx";

-- DropIndex
DROP INDEX "public"."Payment_studentId_schoolPeriodId_paymentMethodId_idx";

-- DropIndex
DROP INDEX "public"."StudentPeriodDiscount_discountId_studentId_schoolPeriodId_d_key";

-- AlterTable
ALTER TABLE "public"."MonthlyFeeOnGrade" DROP COLUMN "schoolPeriodId",
ADD COLUMN     "schoolMonthId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "schoolPeriodId",
ADD COLUMN     "schoolMonthId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."StudentPeriodDiscount" DROP COLUMN "schoolPeriodId",
ADD COLUMN     "schoolMonthId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "MonthlyFeeOnGrade_monthlyFeeId_gradeId_schoolMonthId_idx" ON "public"."MonthlyFeeOnGrade"("monthlyFeeId", "gradeId", "schoolMonthId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyFeeOnGrade_monthlyFeeId_gradeId_schoolMonthId_delete_key" ON "public"."MonthlyFeeOnGrade"("monthlyFeeId", "gradeId", "schoolMonthId", "deletedAt");

-- CreateIndex
CREATE INDEX "Payment_studentId_schoolMonthId_paymentMethodId_idx" ON "public"."Payment"("studentId", "schoolMonthId", "paymentMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentPeriodDiscount_discountId_studentId_schoolMonthId_de_key" ON "public"."StudentPeriodDiscount"("discountId", "studentId", "schoolMonthId", "deletedAt");

-- AddForeignKey
ALTER TABLE "public"."MonthlyFeeOnGrade" ADD CONSTRAINT "MonthlyFeeOnGrade_schoolMonthId_fkey" FOREIGN KEY ("schoolMonthId") REFERENCES "public"."SchoolPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_schoolMonthId_fkey" FOREIGN KEY ("schoolMonthId") REFERENCES "public"."SchoolPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentPeriodDiscount" ADD CONSTRAINT "StudentPeriodDiscount_schoolMonthId_fkey" FOREIGN KEY ("schoolMonthId") REFERENCES "public"."SchoolPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
