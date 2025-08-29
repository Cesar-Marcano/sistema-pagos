/*
  Warnings:

  - The values [GRADE_FEE_HISTORY] on the enum `AuditableEntities` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `schoolPeriodId` on the `MonthlyFee` table. All the data in the column will be lost.
  - You are about to drop the column `gradeFeeHistoryId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `studentDiscountId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `GradeFeeHistory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[paymentMethodId,reference,deletedAt]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentType` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AuditableEntities_new" AS ENUM ('USER', 'SCHOOL_YEAR', 'SCHOOL_PERIOD', 'STUDENT', 'MONTHLY_FEE', 'GRADE', 'STUDENT_GRADE', 'DISCOUNT', 'STUDENT_DISCOUNT', 'PAYMENT_METHOD', 'PAYMENT', 'PAYMENT_DISCOUNT');
ALTER TABLE "public"."AuditLog" ALTER COLUMN "entity" TYPE "public"."AuditableEntities_new" USING ("entity"::text::"public"."AuditableEntities_new");
ALTER TYPE "public"."AuditableEntities" RENAME TO "AuditableEntities_old";
ALTER TYPE "public"."AuditableEntities_new" RENAME TO "AuditableEntities";
DROP TYPE "public"."AuditableEntities_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."GradeFeeHistory" DROP CONSTRAINT "GradeFeeHistory_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GradeFeeHistory" DROP CONSTRAINT "GradeFeeHistory_monthlyFeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GradeFeeHistory" DROP CONSTRAINT "GradeFeeHistory_schoolPeriodId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MonthlyFee" DROP CONSTRAINT "MonthlyFee_schoolPeriodId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_gradeFeeHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_studentDiscountId_fkey";

-- DropIndex
DROP INDEX "public"."Payment_reference_deletedAt_key";

-- AlterTable
ALTER TABLE "public"."MonthlyFee" DROP COLUMN "schoolPeriodId";

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "gradeFeeHistoryId",
DROP COLUMN "studentDiscountId",
ADD COLUMN     "paymentType" "public"."PaymentType" NOT NULL;

-- DropTable
DROP TABLE "public"."GradeFeeHistory";

-- CreateTable
CREATE TABLE "public"."MonthlyFeeOnGrade" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,
    "monthlyFeeId" INTEGER NOT NULL,
    "schoolPeriodId" INTEGER NOT NULL,

    CONSTRAINT "MonthlyFeeOnGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentDiscount" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,
    "paymentId" INTEGER NOT NULL,
    "studentDiscountId" INTEGER NOT NULL,

    CONSTRAINT "PaymentDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_GradeToMonthlyFeeOnGrade" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GradeToMonthlyFeeOnGrade_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentDiscount_paymentId_studentDiscountId_deletedAt_key" ON "public"."PaymentDiscount"("paymentId", "studentDiscountId", "deletedAt");

-- CreateIndex
CREATE INDEX "_GradeToMonthlyFeeOnGrade_B_index" ON "public"."_GradeToMonthlyFeeOnGrade"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentMethodId_reference_deletedAt_key" ON "public"."Payment"("paymentMethodId", "reference", "deletedAt");

-- AddForeignKey
ALTER TABLE "public"."MonthlyFeeOnGrade" ADD CONSTRAINT "MonthlyFeeOnGrade_monthlyFeeId_fkey" FOREIGN KEY ("monthlyFeeId") REFERENCES "public"."MonthlyFee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MonthlyFeeOnGrade" ADD CONSTRAINT "MonthlyFeeOnGrade_schoolPeriodId_fkey" FOREIGN KEY ("schoolPeriodId") REFERENCES "public"."SchoolPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentDiscount" ADD CONSTRAINT "PaymentDiscount_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentDiscount" ADD CONSTRAINT "PaymentDiscount_studentDiscountId_fkey" FOREIGN KEY ("studentDiscountId") REFERENCES "public"."StudentDiscount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GradeToMonthlyFeeOnGrade" ADD CONSTRAINT "_GradeToMonthlyFeeOnGrade_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GradeToMonthlyFeeOnGrade" ADD CONSTRAINT "_GradeToMonthlyFeeOnGrade_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."MonthlyFeeOnGrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
