/*
  Warnings:

  - You are about to drop the column `schoolYearId` on the `StudentGrade` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[schoolPeriodId,gradeId,studentId,deletedAt]` on the table `StudentGrade` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `schoolPeriodId` to the `StudentGrade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."StudentGrade" DROP CONSTRAINT "StudentGrade_schoolYearId_fkey";

-- DropIndex
DROP INDEX "public"."StudentGrade_schoolYearId_gradeId_studentId_deletedAt_key";

-- AlterTable
ALTER TABLE "public"."StudentGrade" DROP COLUMN "schoolYearId",
ADD COLUMN     "schoolPeriodId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StudentGrade_schoolPeriodId_gradeId_studentId_deletedAt_key" ON "public"."StudentGrade"("schoolPeriodId", "gradeId", "studentId", "deletedAt");

-- AddForeignKey
ALTER TABLE "public"."StudentGrade" ADD CONSTRAINT "StudentGrade_schoolPeriodId_fkey" FOREIGN KEY ("schoolPeriodId") REFERENCES "public"."SchoolPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
