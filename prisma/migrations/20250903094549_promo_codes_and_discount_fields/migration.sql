/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."PromoType" AS ENUM ('PERCENT', 'FIXED');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "promoCodeId" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."Post";

-- CreateTable
CREATE TABLE "public"."PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "public"."PromoType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "minOrderCents" INTEGER,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "perUserLimit" INTEGER,
    "ownerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPromo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promoId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPromo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "public"."PromoCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserPromo_userId_promoId_key" ON "public"."UserPromo"("userId", "promoId");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "public"."PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoCode" ADD CONSTRAINT "PromoCode_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPromo" ADD CONSTRAINT "UserPromo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPromo" ADD CONSTRAINT "UserPromo_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "public"."PromoCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
