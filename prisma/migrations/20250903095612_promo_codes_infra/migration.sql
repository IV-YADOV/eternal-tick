-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "discountCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Order_promoCodeId_idx" ON "public"."Order"("promoCodeId");
