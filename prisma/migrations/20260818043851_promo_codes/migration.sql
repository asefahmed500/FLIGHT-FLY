/*
  Warnings:

  - Added the required column `finalPrice` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Backfill finalPrice from price for existing rows, then enforce NOT NULL.
ALTER TABLE "Booking" ADD COLUMN     "discount" TEXT,
ADD COLUMN     "finalPrice" TEXT,
ADD COLUMN     "promoCode" TEXT;

UPDATE "Booking" SET "finalPrice" = "price" WHERE "finalPrice" IS NULL;

ALTER TABLE "Booking" ALTER COLUMN "finalPrice" SET NOT NULL;

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "percentOff" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");
