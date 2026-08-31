import "dotenv/config";
import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const mediaRoot = process.argv[2] ?? "C:\\Users\\enric\\Dropbox\\Arxius-PC\\media_velilla (3)";
const imagesPerProduct = Number(process.argv[3] ?? "1");
const publicRoot = path.join(process.cwd(), "public", "uploads", "catalog-media");
const supportedImagePattern = /\.(jpe?g|png|webp|avif)$/i;
const targetBrands = ["MUKUA", "VELILLA", "VPRO"];

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

function normalizeKey(value: string | null | undefined) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function safeSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function naturalCompare(left: string, right: string) {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return walkFiles(fullPath);
      return supportedImagePattern.test(entry.name) ? [fullPath] : [];
    }),
  );
  return files.flat().sort(naturalCompare);
}

function indexFiles(files: string[], brandDir: string) {
  const byFolder = new Map<string, string[]>();
  const byPrefix = new Map<string, string[]>();

  for (const file of files) {
    const relativePath = path.relative(brandDir, file);
    const [folder] = relativePath.split(path.sep);
    const baseName = path.basename(file, path.extname(file));
    const prefix = baseName.split("_")[0];

    const folderKey = normalizeKey(folder);
    const prefixKey = normalizeKey(prefix);

    if (!byFolder.has(folderKey)) byFolder.set(folderKey, []);
    if (!byPrefix.has(prefixKey)) byPrefix.set(prefixKey, []);
    byFolder.get(folderKey)?.push(file);
    byPrefix.get(prefixKey)?.push(file);
  }

  return { byFolder, byPrefix };
}

async function copyProductImage(sourcePath: string, brand: string, sku: string, position: number) {
  const extension = path.extname(sourcePath).toLowerCase() || ".jpg";
  const destinationDir = path.join(publicRoot, safeSegment(brand), safeSegment(sku));
  const destinationName = `${String(position + 1).padStart(2, "0")}-${safeSegment(path.basename(sourcePath, extension))}${extension}`;
  const destinationPath = path.join(destinationDir, destinationName);

  await mkdir(destinationDir, { recursive: true });
  await copyFile(sourcePath, destinationPath);

  return `/uploads/catalog-media/${safeSegment(brand)}/${safeSegment(sku)}/${destinationName}`;
}

async function main() {
  if (!Number.isInteger(imagesPerProduct) || imagesPerProduct < 1 || imagesPerProduct > 8) {
    throw new Error("Images per product must be an integer between 1 and 8.");
  }

  const products = await prisma.product.findMany({
    where: {
      brand: { name: { in: targetBrands } },
    },
    select: {
      id: true,
      sku: true,
      name: true,
      brand: { select: { name: true } },
      _count: { select: { images: true } },
    },
    orderBy: [{ brand: { name: "asc" } }, { sku: "asc" }],
  });

  const fileIndexes = new Map<string, ReturnType<typeof indexFiles>>();
  let localImageFiles = 0;
  let localImageBytes = 0;

  for (const brand of targetBrands) {
    const brandDir = path.join(mediaRoot, brand);
    const files = await walkFiles(brandDir);
    localImageFiles += files.length;
    for (const file of files) {
      localImageBytes += (await stat(file)).size;
    }
    fileIndexes.set(brand, indexFiles(files, brandDir));
  }

  let matched = 0;
  let restored = 0;
  let skippedExisting = 0;
  let missing = 0;
  let copiedFiles = 0;

  for (const product of products) {
    const brand = product.brand?.name?.toUpperCase();
    if (!brand || !product.sku) continue;

    if (product._count.images > 0) {
      skippedExisting += 1;
      continue;
    }

    const skuKey = normalizeKey(product.sku);
    const index = fileIndexes.get(brand);
    const matches = index ? index.byFolder.get(skuKey) ?? index.byPrefix.get(skuKey) ?? [] : [];

    if (!matches.length) {
      missing += 1;
      continue;
    }

    matched += 1;
    const urls = [];
    for (const [position, sourcePath] of matches.slice(0, imagesPerProduct).entries()) {
      urls.push(await copyProductImage(sourcePath, brand, product.sku, position));
    }

    await prisma.productImage.createMany({
      data: urls.map((url, position) => ({
        productId: product.id,
        url,
        alt: product.name,
        position,
      })),
      skipDuplicates: true,
    });

    copiedFiles += urls.length;
    restored += 1;

    if (restored % 50 === 0) {
      console.log(`Restored ${restored} products, copied ${copiedFiles} images.`);
    }
  }

  console.log(
    JSON.stringify(
      {
        products: products.length,
        matched,
        restored,
        copiedFiles,
        skippedExisting,
        missing,
        imagesPerProduct,
        localImageFiles,
        localImageGB: Number((localImageBytes / 1024 / 1024 / 1024).toFixed(2)),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
