/*
  Warnings:

  - You are about to drop the column `paymentType` on the `Payment` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentTags" AS ENUM ('FULL', 'PARTIAL', 'REFUND', 'OVERDUE', 'OVERPAYMENT');

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "paymentType",
ADD COLUMN     "paymentTags" "public"."PaymentTags"[];

-- DropEnum
DROP TYPE "public"."PaymentType";
