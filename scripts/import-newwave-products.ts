import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { slugify } from "../lib/admin/utils";
import { normalizeColorGroup, normalizeSizeGroup } from "../lib/catalog/filter-groups";

type NewWaveVariant = {
  sku: string;
  name: string;
  color: string | null;
  size: string | null;
  priceCents: number;
  stock: number;
};

type NewWaveProduct = {
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
  variants: NewWaveVariant[];
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

async function getOrCreateBrand(name: string) {
  const slug = slugify(name);
  return prisma.brand.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  });
}

async function getOrCreateCategory(categoryName: string | null, subcategoryName: string | null) {
  if (!categoryName && !subcategoryName) {
    return null;
  }

  const parent = categoryName
    ? await prisma.category.upsert({
        where: { slug: slugify(categoryName) },
        update: { name: categoryName },
        create: { name: categoryName, slug: slugify(categoryName) },
      })
    : null;

  if (!subcategoryName) {
    return parent;
  }

  return prisma.category.upsert({
    where: { slug: slugify(subcategoryName) },
    update: { name: subcategoryName, parentId: parent?.id ?? null },
    create: { name: subcategoryName, slug: slugify(subcategoryName), parentId: parent?.id ?? null },
  });
}

async function clearCatalog() {
  await prisma.$transaction([
    prisma.orderItem.updateMany({ data: { productId: null, variantId: null } }),
    prisma.productAttributeValue.deleteMany(),
    prisma.variantAttributeValue.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.productDocument.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.attributeValue.deleteMany(),
    prisma.attribute.deleteMany(),
    prisma.category.deleteMany(),
    prisma.brand.deleteMany(),
  ]);
}

async function importProducts(products: NewWaveProduct[]) {
  let created = 0;

  for (const [index, item] of products.entries()) {
    const brand = await getOrCreateBrand(item.brand);
    const category = await getOrCreateCategory(item.category, item.subcategory);
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
        isFeatured: index < 24,
        minPriceCents: Math.min(...prices),
        maxPriceCents: Math.max(...prices),
        categoryId: category?.id ?? null,
        brandId: brand.id,
        images: {
          create: item.images.slice(0, 8).map((url, position) => ({
            url,
            alt: item.name,
            position,
          })),
        },
        documents: {
          create: (item.documents ?? []).map((document, position) => ({
            type: document.type,
            title: document.title,
            url: document.url,
            position,
          })),
        },
        variants: {
          create: item.variants.map((variant) => ({
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
        },
      },
    });

    created += 1;
    if (created % 100 === 0) {
      console.log(`Imported ${created}/${products.length} products (${product.name})`);
    }
  }

  return created;
}

async function main() {
  const inputPath = process.argv[2];
  const shouldReplace = process.argv.includes("--replace");

  if (!inputPath) {
    throw new Error("Usage: tsx scripts/import-newwave-products.ts <normalized-json> [--replace]");
  }

  const products = JSON.parse(await readFile(inputPath, "utf8")) as NewWaveProduct[];

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("No products found in normalized JSON.");
  }

  if (shouldReplace) {
    console.log("Clearing existing catalog products...");
    await clearCatalog();
  }

  const created = await importProducts(products);
  console.log(`Done. Imported ${created} products and ${products.reduce((total, item) => total + item.variants.length, 0)} variants.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
