/*
  Warnings:

  - You are about to drop the column `studentDiscountId` on the `PaymentDiscount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentId,discountId,deletedAt]` on the table `PaymentDiscount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `discountId` to the `PaymentDiscount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."PaymentDiscount" DROP CONSTRAINT "PaymentDiscount_studentDiscountId_fkey";

-- DropIndex
DROP INDEX "public"."PaymentDiscount_paymentId_studentDiscountId_deletedAt_key";

-- AlterTable
ALTER TABLE "public"."PaymentDiscount" DROP COLUMN "studentDiscountId",
ADD COLUMN     "discountId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentDiscount_paymentId_discountId_deletedAt_key" ON "public"."PaymentDiscount"("paymentId", "discountId", "deletedAt");

-- AddForeignKey
ALTER TABLE "public"."PaymentDiscount" ADD CONSTRAINT "PaymentDiscount_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
