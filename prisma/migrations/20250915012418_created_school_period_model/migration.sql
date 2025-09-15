/*
  Warnings:

  - You are about to drop the column `schoolYearId` on the `SchoolMonth` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[month,schoolPeriodId,deletedAt]` on the table `SchoolMonth` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `schoolPeriodId` to the `SchoolMonth` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."SchoolMonth" DROP CONSTRAINT "SchoolMonth_schoolYearId_fkey";

-- DropIndex
DROP INDEX "public"."SchoolMonth_month_schoolYearId_deletedAt_key";

-- DropIndex
DROP INDEX "public"."SchoolMonth_month_schoolYearId_idx";

-- AlterTable
ALTER TABLE "public"."SchoolMonth" DROP COLUMN "schoolYearId",
ADD COLUMN     "schoolPeriodId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."SchoolPeriod" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,
    "schoolYearId" INTEGER NOT NULL,

    CONSTRAINT "SchoolPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchoolPeriod_name_idx" ON "public"."SchoolPeriod" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "SchoolPeriod_schoolYearId_idx" ON "public"."SchoolPeriod"("schoolYearId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolPeriod_name_schoolYearId_deletedAt_key" ON "public"."SchoolPeriod"("name", "schoolYearId", "deletedAt");

-- CreateIndex
CREATE INDEX "SchoolMonth_month_schoolPeriodId_idx" ON "public"."SchoolMonth"("month", "schoolPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolMonth_month_schoolPeriodId_deletedAt_key" ON "public"."SchoolMonth"("month", "schoolPeriodId", "deletedAt");

-- AddForeignKey
ALTER TABLE "public"."SchoolPeriod" ADD CONSTRAINT "SchoolPeriod_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "public"."SchoolYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchoolMonth" ADD CONSTRAINT "SchoolMonth_schoolPeriodId_fkey" FOREIGN KEY ("schoolPeriodId") REFERENCES "public"."SchoolPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
