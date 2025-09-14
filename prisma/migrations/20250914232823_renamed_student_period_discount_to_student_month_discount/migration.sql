/*
  Warnings:

  - The values [StudentPeriodDiscount] on the enum `PurgableModels` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `StudentPeriodDiscount` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PurgableModels_new" AS ENUM ('User', 'SchoolYear', 'SchoolPeriod', 'Student', 'MonthlyFee', 'MonthlyFeeOnGrade', 'Grade', 'StudentGrade', 'Discount', 'StudentDiscount', 'PaymentMethod', 'Payment', 'StudentMonthDiscount');
ALTER TYPE "public"."PurgableModels" RENAME TO "PurgableModels_old";
ALTER TYPE "public"."PurgableModels_new" RENAME TO "PurgableModels";
DROP TYPE "public"."PurgableModels_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."StudentPeriodDiscount" DROP CONSTRAINT "StudentPeriodDiscount_discountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudentPeriodDiscount" DROP CONSTRAINT "StudentPeriodDiscount_schoolMonthId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudentPeriodDiscount" DROP CONSTRAINT "StudentPeriodDiscount_studentId_fkey";

-- DropTable
DROP TABLE "public"."StudentPeriodDiscount";

-- CreateTable
CREATE TABLE "public"."StudentMonthDiscount" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,
    "discountId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "schoolMonthId" INTEGER NOT NULL,

    CONSTRAINT "StudentMonthDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentMonthDiscount_discountId_studentId_schoolMonthId_del_key" ON "public"."StudentMonthDiscount"("discountId", "studentId", "schoolMonthId", "deletedAt");

-- AddForeignKey
ALTER TABLE "public"."StudentMonthDiscount" ADD CONSTRAINT "StudentMonthDiscount_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentMonthDiscount" ADD CONSTRAINT "StudentMonthDiscount_schoolMonthId_fkey" FOREIGN KEY ("schoolMonthId") REFERENCES "public"."SchoolMonth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentMonthDiscount" ADD CONSTRAINT "StudentMonthDiscount_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
