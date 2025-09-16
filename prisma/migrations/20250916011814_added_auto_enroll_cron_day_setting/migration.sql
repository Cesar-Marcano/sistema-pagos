-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Settings" ADD VALUE 'AUTO_ENROLL_PERIOD_CRON_DAY';
ALTER TYPE "public"."Settings" ADD VALUE 'AUTO_ENROLL_GRADE_CRON_DAY';
