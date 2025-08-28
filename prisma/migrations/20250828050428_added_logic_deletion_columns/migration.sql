/*
  Warnings:

  - A unique constraint covering the columns `[name,deletedAt]` on the table `Discount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,deletedAt]` on the table `Grade` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[description,deletedAt]` on the table `MonthlyFee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reference,deletedAt]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,deletedAt]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[month,schoolYearId,deletedAt]` on the table `SchoolPeriod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,deletedAt]` on the table `SchoolYear` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,deletedAt]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,discountId,schoolPeriodId,deletedAt]` on the table `StudentDiscount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schoolYearId,gradeId,studentId,deletedAt]` on the table `StudentGrade` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,deletedAt]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Discount_name_key";

-- DropIndex
DROP INDEX "public"."Grade_name_key";

-- DropIndex
DROP INDEX "public"."SchoolYear_name_key";

-- DropIndex
DROP INDEX "public"."Student_name_key";

-- DropIndex
DROP INDEX "public"."StudentDiscount_studentId_discountId_schoolPeriodId_key";

-- DropIndex
DROP INDEX "public"."User_username_key";

-- AlterTable
ALTER TABLE "public"."Discount" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Grade" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."MonthlyFee" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."PaymentMethod" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."SchoolPeriod" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."SchoolYear" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."StudentDiscount" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."StudentGrade" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."Setting" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_name_key" ON "public"."Setting"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Discount_name_deletedAt_key" ON "public"."Discount"("name", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_name_deletedAt_key" ON "public"."Grade"("name", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyFee_description_deletedAt_key" ON "public"."MonthlyFee"("description", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_deletedAt_key" ON "public"."Payment"("reference", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_name_deletedAt_key" ON "public"."PaymentMethod"("name", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolPeriod_month_schoolYearId_deletedAt_key" ON "public"."SchoolPeriod"("month", "schoolYearId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolYear_name_deletedAt_key" ON "public"."SchoolYear"("name", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Student_name_deletedAt_key" ON "public"."Student"("name", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentDiscount_studentId_discountId_schoolPeriodId_deleted_key" ON "public"."StudentDiscount"("studentId", "discountId", "schoolPeriodId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentGrade_schoolYearId_gradeId_studentId_deletedAt_key" ON "public"."StudentGrade"("schoolYearId", "gradeId", "studentId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_deletedAt_key" ON "public"."User"("username", "deletedAt");
