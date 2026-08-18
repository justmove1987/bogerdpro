-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "gender" TEXT,
ADD COLUMN     "material" TEXT;

-- CreateIndex
CREATE INDEX "Product_gender_idx" ON "Product"("gender");

-- CreateIndex
CREATE INDEX "Product_material_idx" ON "Product"("material");
