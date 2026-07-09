-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxPriceCents" INTEGER,
ADD COLUMN     "minPriceCents" INTEGER;

-- CreateIndex
CREATE INDEX "Product_isFeatured_idx" ON "Product"("isFeatured");

-- CreateIndex
CREATE INDEX "Product_minPriceCents_idx" ON "Product"("minPriceCents");
