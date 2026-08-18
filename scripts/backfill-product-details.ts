import "dotenv/config";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

type NewWaveProduct = {
  productNumber: string;
  gender?: string | null;
  material?: string | null;
  specifications?: { label: string; value: string }[];
  documents?: { type: string; title: string; url: string }[];
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    throw new Error("Usage: tsx scripts/backfill-product-details.ts <normalized-json>");
  }

  const products = JSON.parse(await readFile(inputPath, "utf8")) as NewWaveProduct[];
  const productNumbers = products.map((item) => item.productNumber);
  const dbProducts = await prisma.product.findMany({
    where: { sku: { in: productNumbers } },
    select: { id: true, sku: true },
  });
  const productBySku = new Map(dbProducts.flatMap((product) => (product.sku ? [[product.sku, product]] : [])));
  const matchedProducts = products.flatMap((item) => {
    const product = productBySku.get(item.productNumber);
    return product ? [{ ...item, id: product.id }] : [];
  });

  await prisma.productDocument.deleteMany({
    where: { productId: { in: matchedProducts.map((product) => product.id) } },
  });

  const documentRows = matchedProducts.flatMap((item) =>
    (item.documents ?? []).map((document, position) => ({
      id: randomUUID(),
      productId: item.id,
      type: document.type,
      title: document.title,
      url: document.url,
      position,
    })),
  );

  for (let index = 0; index < documentRows.length; index += 500) {
    await prisma.productDocument.createMany({
      data: documentRows.slice(index, index + 500),
      skipDuplicates: true,
    });
  }

  for (let index = 0; index < matchedProducts.length; index += 25) {
    await Promise.all(
      matchedProducts.slice(index, index + 25).map((item) =>
        prisma.product.update({
          where: { id: item.id },
          data: {
            gender: item.gender ?? null,
            material: item.material ?? null,
            specifications: item.specifications ?? [],
          },
        }),
      ),
    );
  }

  console.log(`Updated ${matchedProducts.length} products with ${documentRows.length} document links.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
