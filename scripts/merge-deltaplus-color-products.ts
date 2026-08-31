import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { slugify } from "../lib/admin/utils";

const shouldApply = process.argv.includes("--apply");
const colorWords = new Set([
  "AHUMADO",
  "AMARELO",
  "AMARILLO",
  "AZUL",
  "BC",
  "BEIGE",
  "BL",
  "BLANC",
  "BLANCA",
  "BLANCO",
  "BLEU",
  "CLEAR",
  "FU",
  "GRIS",
  "IN",
  "JA",
  "JAUNE",
  "KAKI",
  "MARRON",
  "MARRÓN",
  "NARANJA",
  "NATURAL",
  "NEGRA",
  "NEGRO",
  "NOIR",
  "OR",
  "ORANGE",
  "RO",
  "ROJA",
  "ROJO",
  "ROUGE",
  "SMOKE",
  "TRANSPARENTE",
  "VE",
  "VERDE",
  "VERT",
]);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

function baseProductNumber(sku: string | null) {
  const withoutPrefix = (sku ?? "").replace(/^DELTA-/i, "").trim();
  const parts = withoutPrefix.split(/\s+/);
  while (parts.length > 1 && colorWords.has(parts.at(-1)?.toUpperCase() ?? "")) {
    parts.pop();
  }
  return parts.join(" ");
}

function preferredProduct<T extends { sku: string | null }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftBase = left.sku === `DELTA-${baseProductNumber(left.sku)}` ? 0 : 1;
    const rightBase = right.sku === `DELTA-${baseProductNumber(right.sku)}` ? 0 : 1;
    return leftBase - rightBase || (left.sku ?? "").localeCompare(right.sku ?? "");
  })[0];
}

async function main() {
  const products = await prisma.product.findMany({
    where: { brand: { name: "Delta Plus" } },
    select: {
      id: true,
      sku: true,
      name: true,
      slug: true,
      description: true,
      gender: true,
      material: true,
      specifications: true,
      status: true,
      isActive: true,
      minPriceCents: true,
      maxPriceCents: true,
      categoryId: true,
      brandId: true,
      images: { orderBy: { position: "asc" }, select: { id: true, url: true } },
      documents: { select: { id: true, type: true, title: true, url: true, position: true } },
      variants: { select: { id: true, priceCents: true } },
    },
    orderBy: { sku: "asc" },
  });

  const groups = new Map<string, typeof products>();
  for (const product of products) {
    const base = baseProductNumber(product.sku);
    const key = [base, product.name, product.categoryId ?? "", product.minPriceCents ?? "", product.maxPriceCents ?? ""].join("||");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)?.push(product);
  }

  const mergeGroups = [...groups.values()].filter((group) => group.length > 1);
  const summary = mergeGroups.map((group) => ({
    base: baseProductNumber(group[0].sku),
    count: group.length,
    keep: preferredProduct(group).sku,
    merge: group.map((item) => item.sku),
  }));

  console.log(JSON.stringify({ apply: shouldApply, groups: mergeGroups.length, productsAffected: mergeGroups.reduce((sum, group) => sum + group.length, 0), summary }, null, 2));

  if (!shouldApply) return;

  for (const group of mergeGroups) {
    const target = preferredProduct(group);
    const sources = group.filter((item) => item.id !== target.id);
    const sourceIds = sources.map((item) => item.id);
    const base = baseProductNumber(target.sku);
    const targetSku = `DELTA-${base}`;
    const targetSlug = `${slugify(target.name)}-delta-${slugify(base)}`;
    const allPrices = group.flatMap((item) => item.variants.map((variant) => variant.priceCents));

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: target.id },
        data: {
          sku: targetSku,
          slug: targetSlug,
          minPriceCents: Math.min(...allPrices),
          maxPriceCents: Math.max(...allPrices),
        },
      });

      await tx.productVariant.updateMany({
        where: { productId: { in: sourceIds } },
        data: { productId: target.id },
      });

      const existingDocumentUrls = new Set(target.documents.map((document) => document.url));
      const documentsToCreate = sources
        .flatMap((source) => source.documents)
        .filter((document) => !existingDocumentUrls.has(document.url))
        .map((document, index) => ({
          productId: target.id,
          type: document.type,
          title: document.title,
          url: document.url,
          position: target.documents.length + index,
        }));

      if (documentsToCreate.length) {
        await tx.productDocument.createMany({ data: documentsToCreate, skipDuplicates: true });
      }

      await tx.productDocument.deleteMany({ where: { productId: { in: sourceIds } } });
      await tx.productImage.updateMany({
        where: { productId: { in: sourceIds } },
        data: { productId: target.id },
      });
      await tx.orderItem.updateMany({
        where: { productId: { in: sourceIds } },
        data: { productId: target.id },
      });
      await tx.product.deleteMany({ where: { id: { in: sourceIds } } });

      const images = await tx.productImage.findMany({
        where: { productId: target.id },
        orderBy: [{ position: "asc" }, { id: "asc" }],
        select: { id: true },
      });

      await Promise.all(
        images.map((image, position) =>
          tx.productImage.update({
            where: { id: image.id },
            data: { position },
          }),
        ),
      );
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
