import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

type NewWaveProduct = {
  productNumber: string;
  name: string;
  images: string[];
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const inputPath = process.argv[2] ?? "tmp/newwave-products.json";
  const products = JSON.parse(await readFile(inputPath, "utf8")) as NewWaveProduct[];
  let restored = 0;

  for (const item of products) {
    const product = await prisma.product.findUnique({
      where: { sku: item.productNumber },
      select: { id: true, name: true, _count: { select: { images: true } } },
    });

    if (!product || product._count.images > 0 || item.images.length === 0) {
      continue;
    }

    await prisma.productImage.createMany({
      data: item.images.slice(0, 8).map((url, position) => ({
        productId: product.id,
        url,
        alt: product.name,
        position,
      })),
    });
    restored += 1;
  }

  console.log(JSON.stringify({ restored }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
