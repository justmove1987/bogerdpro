-- Harden the precomputed catalog grouping table for Supabase public API roles.
-- The app reads this table through Prisma on the server, so anon/authenticated
-- roles do not need direct table access.

ALTER TABLE "ProductCatalogGroup" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE "ProductCatalogGroup" FROM anon, authenticated;

