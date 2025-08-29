/*
  Warnings:

  - You are about to drop the `_GradeToMonthlyFeeOnGrade` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `gradeId` to the `MonthlyFeeOnGrade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_GradeToMonthlyFeeOnGrade" DROP CONSTRAINT "_GradeToMonthlyFeeOnGrade_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_GradeToMonthlyFeeOnGrade" DROP CONSTRAINT "_GradeToMonthlyFeeOnGrade_B_fkey";

-- AlterTable
ALTER TABLE "public"."MonthlyFeeOnGrade" ADD COLUMN     "gradeId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."_GradeToMonthlyFeeOnGrade";

-- AddForeignKey
ALTER TABLE "public"."MonthlyFeeOnGrade" ADD CONSTRAINT "MonthlyFeeOnGrade_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
