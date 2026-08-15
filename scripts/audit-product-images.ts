import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

type ImageCheck = {
  id: string;
  url: string;
  position: number;
  ok: boolean;
  status?: number;
  contentType?: string | null;
  error?: string;
};

type ProductReport = {
  sku: string | null;
  name: string;
  slug: string;
  brand: string | null;
  category: string | null;
  imageCount: number;
  workingImageCount: number;
  coverOk: boolean;
  images: ImageCheck[];
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

const outputPath = process.argv[2] ?? "tmp/product-image-audit.json";
const batchSize = Number(process.env.IMAGE_AUDIT_BATCH_SIZE ?? 3);
const timeoutMs = Number(process.env.IMAGE_AUDIT_TIMEOUT_MS ?? 8000);
const retryCount = Number(process.env.IMAGE_AUDIT_RETRIES ?? 2);
const batchDelayMs = Number(process.env.IMAGE_AUDIT_BATCH_DELAY_MS ?? 350);
const auditMode = process.env.IMAGE_AUDIT_MODE === "all" ? "all" : "cover";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkImageOnce(url: string): Promise<Omit<ImageCheck, "id" | "url" | "position">> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    await response.body?.cancel();

    const contentType = response.headers.get("content-type");
    return {
      ok: response.ok && Boolean(contentType?.startsWith("image/")),
      status: response.status,
      contentType,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown image check error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function imageExists(url: string): Promise<Omit<ImageCheck, "id" | "url" | "position">> {
  let lastResult: Omit<ImageCheck, "id" | "url" | "position"> = { ok: false };

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    const result = await checkImageOnce(url);

    if (result.ok) {
      return result;
    }

    lastResult = result;
    if (attempt < retryCount) {
      await delay(300 * (attempt + 1));
    }
  }

  return lastResult;
}

async function checkProduct(product: Awaited<ReturnType<typeof getProducts>>[number]): Promise<ProductReport | null> {
  if (!product.images.length) {
    return {
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      brand: product.brand?.name ?? null,
      category: product.category?.name ?? null,
      imageCount: 0,
      workingImageCount: 0,
      coverOk: false,
      images: [],
    };
  }

  const imagesToCheck = auditMode === "all" ? product.images : product.images.slice(0, 1);
  const images = await Promise.all(
    imagesToCheck.map(async (image) => ({
      id: image.id,
      url: image.url,
      position: image.position,
      ...(await imageExists(image.url)),
    })),
  );
  const workingImageCount = images.filter((image) => image.ok).length;
  const coverOk = images[0]?.ok ?? false;

  if (auditMode === "cover" && coverOk) {
    return null;
  }

  if (auditMode === "all" && workingImageCount > 0 && coverOk) {
    return null;
  }

  return {
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    brand: product.brand?.name ?? null,
    category: product.category?.name ?? null,
    imageCount: product.images.length,
    workingImageCount,
    coverOk,
    images,
  };
}

function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true, status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: {
      sku: true,
      name: true,
      slug: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
      images: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          url: true,
          position: true,
        },
      },
    },
  });
}

async function main() {
  const products = await getProducts();
  const reports: ProductReport[] = [];
  let checkedImages = 0;

  for (let index = 0; index < products.length; index += batchSize) {
    const batch = products.slice(index, index + batchSize);
    const batchReports = await Promise.all(batch.map(checkProduct));

    for (const report of batchReports) {
      if (!report) continue;
      checkedImages += report.imageCount;
      reports.push(report);
    }

    const processed = Math.min(index + batchSize, products.length);
    if (processed % 80 === 0 || processed === products.length) {
      console.log(`Checked ${processed}/${products.length} products. Issues so far: ${reports.length}.`);
    }

    if (batchDelayMs > 0 && processed < products.length) {
      await delay(batchDelayMs);
    }
  }

  const withoutImages = reports.filter((item) => item.imageCount === 0);
  const withoutWorkingImage = reports.filter((item) => item.imageCount > 0 && item.workingImageCount === 0);
  const brokenCoverOnly = reports.filter((item) => item.imageCount > 0 && item.workingImageCount > 0 && !item.coverOk);
  const payload = {
    generatedAt: new Date().toISOString(),
    totals: {
      mode: auditMode,
      activeProducts: products.length,
      checkedProblemImages: checkedImages,
      productsWithIssues: reports.length,
      withoutImages: withoutImages.length,
      withoutWorkingImage: withoutWorkingImage.length,
      brokenCoverOnly: brokenCoverOnly.length,
    },
    withoutImages,
    withoutWorkingImage,
    brokenCoverOnly,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify(payload.totals, null, 2));
  console.log(`Report written to ${outputPath}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
