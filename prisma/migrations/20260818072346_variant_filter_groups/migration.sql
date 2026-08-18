-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "colorGroup" TEXT,
ADD COLUMN     "sizeGroup" TEXT;

-- CreateIndex
CREATE INDEX "ProductVariant_colorGroup_idx" ON "ProductVariant"("colorGroup");

-- CreateIndex
CREATE INDEX "ProductVariant_sizeGroup_idx" ON "ProductVariant"("sizeGroup");
