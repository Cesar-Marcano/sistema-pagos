/*
  Warnings:

  - The values [FEE] on the enum `PaymentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PaymentType_new" AS ENUM ('FULL', 'PARTIAL', 'REFUND', 'OVERDUE');
ALTER TABLE "public"."Payment" ALTER COLUMN "paymentType" TYPE "public"."PaymentType_new" USING ("paymentType"::text::"public"."PaymentType_new");
ALTER TYPE "public"."PaymentType" RENAME TO "PaymentType_old";
ALTER TYPE "public"."PaymentType_new" RENAME TO "PaymentType";
DROP TYPE "public"."PaymentType_old";
COMMIT;
