ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "approvalEmailSentAt" TIMESTAMP(3);

UPDATE "Customer"
SET "approvedAt" = CURRENT_TIMESTAMP
WHERE "userId" IS NOT NULL AND "approvedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "Customer_approvedAt_idx" ON "Customer"("approvedAt");
