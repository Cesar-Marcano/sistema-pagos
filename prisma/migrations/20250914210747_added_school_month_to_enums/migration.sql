/*
  Warnings:

  - The values [STUDENT_PERIOD_DISCOUNT] on the enum `AuditableEntities` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AuditableEntities_new" AS ENUM ('USER', 'SCHOOL_YEAR', 'SCHOOL_PERIOD', 'SCHOOL_MONTH', 'STUDENT', 'MONTHLY_FEE', 'MONTHLY_FEE_ON_GRADE', 'GRADE', 'STUDENT_GRADE', 'DISCOUNT', 'STUDENT_DISCOUNT', 'STUDENT_MONTH_DISCOUNT', 'PAYMENT_METHOD', 'PAYMENT', 'SETTING');
ALTER TABLE "public"."AuditLog" ALTER COLUMN "entity" TYPE "public"."AuditableEntities_new" USING ("entity"::text::"public"."AuditableEntities_new");
ALTER TYPE "public"."AuditableEntities" RENAME TO "AuditableEntities_old";
ALTER TYPE "public"."AuditableEntities_new" RENAME TO "AuditableEntities";
DROP TYPE "public"."AuditableEntities_old";
COMMIT;

-- AlterEnum
ALTER TYPE "public"."Settings" ADD VALUE 'ACTUAL_SCHOOL_MONTH_ID';
