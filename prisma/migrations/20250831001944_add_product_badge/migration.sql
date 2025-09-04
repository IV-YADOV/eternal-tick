-- CreateEnum
CREATE TYPE "public"."ProductBadge" AS ENUM ('NEW', 'SALE', 'HIT', 'LIMITED');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "badge" "public"."ProductBadge";
