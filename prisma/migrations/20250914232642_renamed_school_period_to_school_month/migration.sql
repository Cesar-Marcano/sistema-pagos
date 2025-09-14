/*
  Warnings:

  - You are about to drop the `SchoolPeriod` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."MonthlyFeeOnGrade" DROP CONSTRAINT "MonthlyFeeOnGrade_schoolMonthId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_schoolMonthId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SchoolPeriod" DROP CONSTRAINT "SchoolPeriod_schoolYearId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudentPeriodDiscount" DROP CONSTRAINT "StudentPeriodDiscount_schoolMonthId_fkey";

-- DropTable
DROP TABLE "public"."SchoolPeriod";

-- CreateTable
CREATE TABLE "public"."SchoolMonth" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,
    "schoolYearId" INTEGER NOT NULL,

    CONSTRAINT "SchoolMonth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchoolMonth_name_idx" ON "public"."SchoolMonth" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "SchoolMonth_month_schoolYearId_idx" ON "public"."SchoolMonth"("month", "schoolYearId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolMonth_month_schoolYearId_deletedAt_key" ON "public"."SchoolMonth"("month", "schoolYearId", "deletedAt");

-- AddForeignKey
ALTER TABLE "public"."SchoolMonth" ADD CONSTRAINT "SchoolMonth_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "public"."SchoolYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MonthlyFeeOnGrade" ADD CONSTRAINT "MonthlyFeeOnGrade_schoolMonthId_fkey" FOREIGN KEY ("schoolMonthId") REFERENCES "public"."SchoolMonth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_schoolMonthId_fkey" FOREIGN KEY ("schoolMonthId") REFERENCES "public"."SchoolMonth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentPeriodDiscount" ADD CONSTRAINT "StudentPeriodDiscount_schoolMonthId_fkey" FOREIGN KEY ("schoolMonthId") REFERENCES "public"."SchoolMonth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
