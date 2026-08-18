-- CreateTable
CREATE TABLE "UserBrandDiscount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "percent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBrandDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserBrandDiscount_brandId_idx" ON "UserBrandDiscount"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBrandDiscount_userId_brandId_key" ON "UserBrandDiscount"("userId", "brandId");

-- AddForeignKey
ALTER TABLE "UserBrandDiscount" ADD CONSTRAINT "UserBrandDiscount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBrandDiscount" ADD CONSTRAINT "UserBrandDiscount_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
