import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { isLocale } from "../config/i18n";

type TranslationPayload = {
  locale: string;
  products?: {
    id: string;
    name?: string;
    description?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
  }[];
  categories?: {
    id: string;
    name?: string;
    description?: string | null;
  }[];
  brands?: {
    id: string;
    name?: string;
  }[];
  attributes?: {
    id: string;
    name?: string;
  }[];
  attributeValues?: {
    id: string;
    value?: string;
  }[];
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

function clean(value: string | null | undefined) {
  return value?.trim() || null;
}

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    throw new Error("Usage: tsx scripts/import-catalog-translations.ts <catalog-translations-locale.json>");
  }

  const payload = JSON.parse(await readFile(inputPath, "utf8")) as TranslationPayload;

  if (!isLocale(payload.locale) || payload.locale === "es") {
    throw new Error("The translation file must use locale ca, en or nl.");
  }

  let count = 0;

  for (const product of payload.products ?? []) {
    const name = clean(product.name);
    if (!name) continue;

    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: product.id, locale: payload.locale } },
      update: {
        name,
        description: clean(product.description),
        metaTitle: clean(product.metaTitle),
        metaDescription: clean(product.metaDescription),
      },
      create: {
        productId: product.id,
        locale: payload.locale,
        name,
        description: clean(product.description),
        metaTitle: clean(product.metaTitle),
        metaDescription: clean(product.metaDescription),
      },
    });
    count += 1;
  }

  for (const category of payload.categories ?? []) {
    const name = clean(category.name);
    if (!name) continue;

    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale: payload.locale } },
      update: { name, description: clean(category.description) },
      create: { categoryId: category.id, locale: payload.locale, name, description: clean(category.description) },
    });
    count += 1;
  }

  for (const brand of payload.brands ?? []) {
    const name = clean(brand.name);
    if (!name) continue;

    await prisma.brandTranslation.upsert({
      where: { brandId_locale: { brandId: brand.id, locale: payload.locale } },
      update: { name },
      create: { brandId: brand.id, locale: payload.locale, name },
    });
    count += 1;
  }

  for (const attribute of payload.attributes ?? []) {
    const name = clean(attribute.name);
    if (!name) continue;

    await prisma.attributeTranslation.upsert({
      where: { attributeId_locale: { attributeId: attribute.id, locale: payload.locale } },
      update: { name },
      create: { attributeId: attribute.id, locale: payload.locale, name },
    });
    count += 1;
  }

  for (const value of payload.attributeValues ?? []) {
    const translatedValue = clean(value.value);
    if (!translatedValue) continue;

    await prisma.attributeValueTranslation.upsert({
      where: { attributeValueId_locale: { attributeValueId: value.id, locale: payload.locale } },
      update: { value: translatedValue },
      create: { attributeValueId: value.id, locale: payload.locale, value: translatedValue },
    });
    count += 1;
  }

  console.log(`Imported ${count} ${payload.locale} catalog translations.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
