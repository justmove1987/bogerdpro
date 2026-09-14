import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { inferProductCatalogGroups } from "@/lib/catalog/product-catalog-groups";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  }),
});

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true } },
    },
  });

  let groupRows = 0;

  for (const product of products) {
    const groups = inferProductCatalogGroups(product);

    await prisma.$transaction([
      prisma.productCatalogGroup.deleteMany({ where: { productId: product.id } }),
      ...(groups.length
        ? [
            prisma.productCatalogGroup.createMany({
              data: groups.map((group) => ({ productId: product.id, group })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);

    groupRows += groups.length;
  }

  console.log(`Catalog groups refreshed for ${products.length} products (${groupRows} group rows).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
