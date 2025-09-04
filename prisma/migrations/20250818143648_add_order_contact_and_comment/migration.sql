-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('email', 'phone', 'telegram');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "contactMethod" "ContactMethod" NOT NULL DEFAULT 'telegram',
ADD COLUMN     "contactValue" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "customerName" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "email" DROP NOT NULL;
