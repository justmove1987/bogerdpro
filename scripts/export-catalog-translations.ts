import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const locales = ["ca", "en", "nl"] as const;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const outputDir = process.argv[2] ?? "tmp/translations";
  await mkdir(outputDir, { recursive: true });

  const [products, categories, brands, attributes, attributeValues] = await Promise.all([
    prisma.product.findMany({
      orderBy: { sku: "asc" },
      select: {
        id: true,
        sku: true,
        slug: true,
        name: true,
        description: true,
        translations: { select: { locale: true, name: true, description: true, metaTitle: true, metaDescription: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, description: true, translations: { select: { locale: true, name: true, description: true } } },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, translations: { select: { locale: true, name: true } } },
    }),
    prisma.attribute.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, translations: { select: { locale: true, name: true } } },
    }),
    prisma.attributeValue.findMany({
      orderBy: { value: "asc" },
      select: { id: true, slug: true, value: true, attribute: { select: { slug: true } }, translations: { select: { locale: true, value: true } } },
    }),
  ]);

  for (const locale of locales) {
    const payload = {
      locale,
      products: products
        .filter((product) => !product.translations.some((translation) => translation.locale === locale))
        .map((product) => ({
          id: product.id,
          sku: product.sku,
          slug: product.slug,
          sourceName: product.name,
          sourceDescription: product.description,
          name: "",
          description: "",
          metaTitle: "",
          metaDescription: "",
        })),
      categories: categories
        .filter((category) => !category.translations.some((translation) => translation.locale === locale))
        .map((category) => ({
          id: category.id,
          slug: category.slug,
          sourceName: category.name,
          sourceDescription: category.description,
          name: "",
          description: "",
        })),
      brands: brands
        .filter((brand) => !brand.translations.some((translation) => translation.locale === locale))
        .map((brand) => ({
          id: brand.id,
          slug: brand.slug,
          sourceName: brand.name,
          name: "",
        })),
      attributes: attributes
        .filter((attribute) => !attribute.translations.some((translation) => translation.locale === locale))
        .map((attribute) => ({
          id: attribute.id,
          slug: attribute.slug,
          sourceName: attribute.name,
          name: "",
        })),
      attributeValues: attributeValues
        .filter((value) => !value.translations.some((translation) => translation.locale === locale))
        .map((value) => ({
          id: value.id,
          attributeSlug: value.attribute.slug,
          slug: value.slug,
          sourceValue: value.value,
          value: "",
        })),
    };

    const outputPath = path.join(outputDir, `catalog-translations-${locale}.json`);
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`Created ${outputPath}`);
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
