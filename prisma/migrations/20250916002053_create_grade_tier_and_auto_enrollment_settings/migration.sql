/*
  Warnings:

  - A unique constraint covering the columns `[tier,deletedAt]` on the table `Grade` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Settings" ADD VALUE 'AUTO_ENROLL_STUDENTS_IN_NEW_PERIOD';
ALTER TYPE "public"."Settings" ADD VALUE 'AUTO_ENROLL_STUDENTS_IN_NEW_GRADE';

-- AlterTable
ALTER TABLE "public"."Grade" ADD COLUMN     "tier" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Grade_tier_idx" ON "public"."Grade"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_tier_deletedAt_key" ON "public"."Grade"("tier", "deletedAt");
