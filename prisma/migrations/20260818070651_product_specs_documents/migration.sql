-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "specifications" JSONB;

-- CreateTable
CREATE TABLE "ProductDocument" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductDocument_productId_position_idx" ON "ProductDocument"("productId", "position");

-- CreateIndex
CREATE INDEX "ProductDocument_type_idx" ON "ProductDocument"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ProductDocument_productId_url_key" ON "ProductDocument"("productId", "url");

-- AddForeignKey
ALTER TABLE "ProductDocument" ADD CONSTRAINT "ProductDocument_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
