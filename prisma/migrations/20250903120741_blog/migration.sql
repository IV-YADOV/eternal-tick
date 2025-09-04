/*
  Warnings:

  - You are about to drop the column `content` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Post" DROP COLUMN "content",
ADD COLUMN     "contentMd" TEXT NOT NULL DEFAULT '';
