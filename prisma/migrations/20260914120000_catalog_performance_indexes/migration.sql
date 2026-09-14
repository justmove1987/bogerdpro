-- CreateIndex
CREATE INDEX "Product_isActive_status_idx" ON "Product"("isActive", "status");

-- CreateIndex
CREATE INDEX "Product_isActive_status_isFeatured_createdAt_idx" ON "Product"("isActive", "status", "isFeatured", "createdAt");

-- CreateIndex
CREATE INDEX "Product_maxPriceCents_idx" ON "Product"("maxPriceCents");

-- CreateIndex
CREATE INDEX "Product_isActive_status_minPriceCents_idx" ON "Product"("isActive", "status", "minPriceCents");

-- CreateIndex
CREATE INDEX "Product_isActive_status_maxPriceCents_idx" ON "Product"("isActive", "status", "maxPriceCents");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_isActive_priceCents_idx" ON "ProductVariant"("productId", "isActive", "priceCents");

-- CreateIndex
CREATE INDEX "ProductVariant_isActive_colorGroup_idx" ON "ProductVariant"("isActive", "colorGroup");

-- CreateIndex
CREATE INDEX "ProductVariant_isActive_sizeGroup_idx" ON "ProductVariant"("isActive", "sizeGroup");

-- CreateIndex
CREATE INDEX "ProductVariant_isActive_priceCents_idx" ON "ProductVariant"("isActive", "priceCents");

-- CreateIndex
CREATE INDEX "ProductImage_productId_url_idx" ON "ProductImage"("productId", "url");
