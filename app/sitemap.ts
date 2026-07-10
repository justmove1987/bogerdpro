import type { MetadataRoute } from "next";
import { downloadableCatalogSections } from "@/config/downloadable-catalogs";
import { prisma } from "@/lib/db/prisma";
import { absoluteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { isActive: true, status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/catalog"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/contacto"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/condiciones-generales"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/politica-privacidad"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const catalogRoutes: MetadataRoute.Sitemap = downloadableCatalogSections.map((section) => ({
    url: absoluteUrl(`/catalog/${section.slug}`),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/product/${product.slug}`),
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...catalogRoutes, ...productRoutes];
}
