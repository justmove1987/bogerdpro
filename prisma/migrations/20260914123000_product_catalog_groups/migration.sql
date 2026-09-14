-- CreateTable
CREATE TABLE "ProductCatalogGroup" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCatalogGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCatalogGroup_productId_group_key" ON "ProductCatalogGroup"("productId", "group");

-- CreateIndex
CREATE INDEX "ProductCatalogGroup_group_idx" ON "ProductCatalogGroup"("group");

-- CreateIndex
CREATE INDEX "ProductCatalogGroup_group_productId_idx" ON "ProductCatalogGroup"("group", "productId");

-- CreateIndex
CREATE INDEX "ProductCatalogGroup_productId_idx" ON "ProductCatalogGroup"("productId");

-- AddForeignKey
ALTER TABLE "ProductCatalogGroup" ADD CONSTRAINT "ProductCatalogGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
