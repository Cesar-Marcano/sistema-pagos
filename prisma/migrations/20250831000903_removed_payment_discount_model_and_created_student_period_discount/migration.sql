/*
  Warnings:

  - The values [PAYMENT_DISCOUNT] on the enum `AuditableEntities` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `PaymentDiscount` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AuditableEntities_new" AS ENUM ('USER', 'SCHOOL_YEAR', 'SCHOOL_PERIOD', 'STUDENT', 'MONTHLY_FEE', 'GRADE', 'STUDENT_GRADE', 'DISCOUNT', 'STUDENT_DISCOUNT', 'PAYMENT_METHOD', 'PAYMENT');
ALTER TABLE "public"."AuditLog" ALTER COLUMN "entity" TYPE "public"."AuditableEntities_new" USING ("entity"::text::"public"."AuditableEntities_new");
ALTER TYPE "public"."AuditableEntities" RENAME TO "AuditableEntities_old";
ALTER TYPE "public"."AuditableEntities_new" RENAME TO "AuditableEntities";
DROP TYPE "public"."AuditableEntities_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."PaymentDiscount" DROP CONSTRAINT "PaymentDiscount_discountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentDiscount" DROP CONSTRAINT "PaymentDiscount_paymentId_fkey";

-- DropTable
DROP TABLE "public"."PaymentDiscount";

-- CreateTable
CREATE TABLE "public"."StudentPeriodDiscount" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,
    "discountId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "schoolPeriodId" INTEGER NOT NULL,

    CONSTRAINT "StudentPeriodDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentPeriodDiscount_discountId_studentId_schoolPeriodId_d_key" ON "public"."StudentPeriodDiscount"("discountId", "studentId", "schoolPeriodId", "deletedAt");

-- AddForeignKey
ALTER TABLE "public"."StudentPeriodDiscount" ADD CONSTRAINT "StudentPeriodDiscount_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentPeriodDiscount" ADD CONSTRAINT "StudentPeriodDiscount_schoolPeriodId_fkey" FOREIGN KEY ("schoolPeriodId") REFERENCES "public"."SchoolPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentPeriodDiscount" ADD CONSTRAINT "StudentPeriodDiscount_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
