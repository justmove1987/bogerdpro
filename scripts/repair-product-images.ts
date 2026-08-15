import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

async function imageExists(url: string) {
  try {
    const response = await fetch(url, { method: "GET" });
    await response.body?.cancel();
    return response.ok && response.headers.get("content-type")?.startsWith("image/");
  } catch {
    return false;
  }
}

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      images: {
        orderBy: { position: "asc" },
        select: { id: true, url: true, position: true },
      },
    },
  });
  let checked = 0;
  let repaired = 0;
  let withoutWorkingImage = 0;
  let processed = 0;

  async function repairProduct(product: (typeof products)[number]) {
    if (!product.images.length) {
      withoutWorkingImage += 1;
      return;
    }

    const results = await Promise.all(
      product.images.map(async (image) => {
        const exists = await imageExists(image.url);
        return { image, exists };
      }),
    );
    const workingImages = results.flatMap((result) => {
      checked += 1;
      return result.exists ? [result.image] : [];
    });

    if (!workingImages.length) {
      withoutWorkingImage += 1;
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      return;
    }

    if (workingImages[0].id !== product.images[0].id || workingImages.length !== product.images.length) {
      repaired += 1;
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.createMany({
        data: workingImages.map((image, position) => ({
          productId: product.id,
          url: image.url,
          alt: product.name,
          position,
        })),
      });
    }
  }

  for (let index = 0; index < products.length; index += 8) {
    const batch = products.slice(index, index + 8);
    await Promise.all(batch.map(repairProduct));
    processed += batch.length;

    if (processed % 80 === 0 || processed === products.length) {
      console.log(`Processed ${processed}/${products.length} products, checked ${checked} images, repaired ${repaired}, ${withoutWorkingImage} without a working image.`);
    }
  }

  console.log(JSON.stringify({ products: products.length, checked, repaired, withoutWorkingImage }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
