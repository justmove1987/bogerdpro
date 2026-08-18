import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { slugify } from "../lib/admin/utils";
import { normalizeColorGroup, normalizeSizeGroup } from "../lib/catalog/filter-groups";

type NormalizedVariant = {
  sku: string;
  name: string;
  color: string | null;
  size: string | null;
  priceCents: number;
  stock: number;
};

type NormalizedProduct = {
  productNumber: string;
  name: string;
  slug: string;
  description: string | null;
  gender?: string | null;
  material?: string | null;
  category: string | null;
  subcategory: string | null;
  brand: string;
  images: string[];
  documents?: { type: string; title: string; url: string }[];
  specifications?: { label: string; value: string }[];
  attributes: Record<string, string>;
  variants: NormalizedVariant[];
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });
const brandCache = new Map<string, string>();
const categoryCache = new Map<string, string | null>();

async function getOrCreateBrandId(name: string) {
  const slug = slugify(name);
  const cached = brandCache.get(slug);
  if (cached) return cached;

  const brand = await prisma.brand.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
    select: { id: true },
  });
  brandCache.set(slug, brand.id);
  return brand.id;
}

async function getOrCreateCategoryId(categoryName: string | null, subcategoryName: string | null) {
  const cacheKey = `${categoryName ?? ""}::${subcategoryName ?? ""}`;
  if (categoryCache.has(cacheKey)) return categoryCache.get(cacheKey) ?? null;

  if (!categoryName && !subcategoryName) {
    categoryCache.set(cacheKey, null);
    return null;
  }

  const parent = categoryName
    ? await prisma.category.upsert({
        where: { slug: slugify(categoryName) },
        update: { name: categoryName },
        create: { name: categoryName, slug: slugify(categoryName) },
        select: { id: true },
      })
    : null;

  if (!subcategoryName) {
    categoryCache.set(cacheKey, parent?.id ?? null);
    return parent?.id ?? null;
  }

  const category = await prisma.category.upsert({
    where: { slug: slugify(subcategoryName) },
    update: { name: subcategoryName, parentId: parent?.id ?? null },
    create: { name: subcategoryName, slug: slugify(subcategoryName), parentId: parent?.id ?? null },
    select: { id: true },
  });
  categoryCache.set(cacheKey, category.id);
  return category.id;
}

async function importProduct(item: NormalizedProduct) {
  const existing = await prisma.product.findUnique({
    where: { sku: item.productNumber },
    select: { id: true },
  });

  if (existing) return false;

  const brandId = await getOrCreateBrandId(item.brand);
  const categoryId = await getOrCreateCategoryId(item.category, item.subcategory);
  const prices = item.variants.map((variant) => variant.priceCents);
  const product = await prisma.product.create({
    data: {
      sku: item.productNumber,
      name: item.name,
      slug: item.slug,
      description: item.description,
      gender: item.gender ?? null,
      material: item.material ?? null,
      specifications: item.specifications ?? [],
      status: "ACTIVE",
      isActive: true,
      minPriceCents: Math.min(...prices),
      maxPriceCents: Math.max(...prices),
      categoryId,
      brandId,
    },
    select: { id: true },
  });

  if (item.images.length) {
    await prisma.productImage.createMany({
      data: item.images.slice(0, 8).map((url, position) => ({
        productId: product.id,
        url,
        alt: item.name,
        position,
      })),
    });
  }

  if (item.documents?.length) {
    await prisma.productDocument.createMany({
      data: item.documents.map((document, position) => ({
        productId: product.id,
        type: document.type,
        title: document.title,
        url: document.url,
        position,
      })),
      skipDuplicates: true,
    });
  }

  await prisma.productVariant.createMany({
    data: item.variants.map((variant) => ({
      productId: product.id,
      sku: variant.sku,
      name: variant.name,
      color: variant.color,
      colorGroup: normalizeColorGroup(variant.color),
      size: variant.size,
      sizeGroup: normalizeSizeGroup(variant.size),
      priceCents: variant.priceCents,
      stock: variant.stock,
      isActive: true,
      attributes: item.attributes,
    })),
    skipDuplicates: true,
  });

  return true;
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("Usage: tsx scripts/import-normalized-products-fast.ts <normalized-json>");
  }

  const products = JSON.parse(await readFile(inputPath, "utf8")) as NormalizedProduct[];
  let created = 0;
  let skipped = 0;

  for (const [index, item] of products.entries()) {
    const wasCreated = await importProduct(item);
    if (wasCreated) {
      created += 1;
    } else {
      skipped += 1;
    }

    if ((index + 1) % 100 === 0) {
      console.log(`Processed ${index + 1}/${products.length}. Created ${created}, skipped ${skipped}.`);
    }
  }

  console.log(`Done. Created ${created} products, skipped ${skipped} existing products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
