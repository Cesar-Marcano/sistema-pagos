/*
  Warnings:

  - A unique constraint covering the columns `[monthlyFeeId,gradeId,schoolPeriodId,deletedAt]` on the table `MonthlyFeeOnGrade` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MonthlyFeeOnGrade_monthlyFeeId_gradeId_schoolPeriodId_delet_key" ON "public"."MonthlyFeeOnGrade"("monthlyFeeId", "gradeId", "schoolPeriodId", "deletedAt");
