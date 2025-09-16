-- CreateEnum
CREATE TYPE "public"."StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "status" "public"."StudentStatus" NOT NULL DEFAULT 'ACTIVE';
