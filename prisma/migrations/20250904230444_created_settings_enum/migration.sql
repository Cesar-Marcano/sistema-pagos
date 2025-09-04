/*
  Warnings:

  - Changed the type of `name` on the `Setting` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."Settings" AS ENUM ('DAYS_UNTIL_OVERDUE', 'PAYMENT_DUE_DAY', 'OVERDUE_FEE_VALUE', 'OVERDUE_FEE_IS_PERCENTAGE', 'SESSION_TIMEOUT_MINUTES', 'MINIMUM_PASSWORD_LENGTH', 'IS_USER_REGISTRATION_ENABLED', 'DB_CLEANUP_DAYS', 'SOFT_DELETED_MODELS_TO_PURGE', 'AUDIT_LOG_RETENTION_DAYS', 'CURRENCY_SYMBOL', 'ACTUAL_SCHOOL_YEAR_ID', 'ACTUAL_SCHOOL_PERIOD_ID');

-- AlterTable
ALTER TABLE "public"."Setting" DROP COLUMN "name",
ADD COLUMN     "name" "public"."Settings" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Setting_name_key" ON "public"."Setting"("name");
