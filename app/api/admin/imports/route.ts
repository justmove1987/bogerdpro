import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ProductStatus } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth/guards";
import { collectCsvValidationErrors, parseProductCsv, type ProductImportRow } from "@/lib/csv/products";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/admin/utils";

type ImportReport = {
  created: number;
  updated: number;
  errors: ReturnType<typeof collectCsvValidationErrors>;
  rows: Array<{
    row: number;
    sku: string;
    action: "created" | "updated";
    productId: string;
  }>;
};

function variantSku(baseSku: string, color?: string, size?: string) {
  const suffix = [color, size].filter(Boolean).map((value) => slugify(value ?? "").toUpperCase()).join("-");
  return suffix ? `${baseSku}-${suffix}` : baseSku;
}

function parseAttributes(value?: string) {
  if (!value) return {};

  return Object.fromEntries(
    value
      .split("|")
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const [key, ...rest] = pair.split("=");
        return [key.trim(), rest.join("=").trim()];
      })
      .filter(([key, attributeValue]) => key && attributeValue),
  );
}

async function uniqueSlug(baseValue: string, model: "product" | "category" | "brand", ignoreId?: string) {
  const baseSlug = slugify(baseValue) || "item";
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing =
      model === "product"
        ? await prisma.product.findUnique({ where: { slug }, select: { id: true } })
        : model === "category"
          ? await prisma.category.findUnique({ where: { slug }, select: { id: true } })
          : await prisma.brand.findUnique({ where: { slug }, select: { id: true } });

    if (!existing || existing.id === ignoreId) return slug;
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function getOrCreateBrand(name?: string) {
  if (!name) return null;

  const slug = slugify(name);
  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) return existing;

  return prisma.brand.create({
    data: {
      name,
      slug: await uniqueSlug(name, "brand"),
    },
  });
}

async function getOrCreateCategory(categoryName?: string, subcategoryName?: string) {
  if (!categoryName && !subcategoryName) return null;

  let parent = null;
  if (categoryName) {
    const parentSlug = slugify(categoryName);
    parent =
      (await prisma.category.findUnique({ where: { slug: parentSlug } })) ??
      (await prisma.category.create({
        data: {
          name: categoryName,
          slug: await uniqueSlug(categoryName, "category"),
        },
      }));
  }

  if (!subcategoryName) return parent;

  const childSlug = slugify(subcategoryName);
  const existingChild = await prisma.category.findUnique({ where: { slug: childSlug } });
  if (existingChild) return existingChild;

  return prisma.category.create({
    data: {
      name: subcategoryName,
      slug: await uniqueSlug(subcategoryName, "category"),
      parentId: parent?.id ?? null,
    },
  });
}

async function importProduct(row: ProductImportRow, rowNumber: number) {
  const existingProduct = await prisma.product.findUnique({
    where: { sku: row.sku },
    select: { id: true, slug: true },
  });

  const brand = await getOrCreateBrand(row.brand);
  const category = await getOrCreateCategory(row.category, row.subcategory);
  const productSlug = existingProduct?.slug ?? (await uniqueSlug(row.name, "product"));
  const status = row.isActive ? ProductStatus.ACTIVE : ProductStatus.INACTIVE;
  const attributes = parseAttributes(row.attributes);

  const product = existingProduct
    ? await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          name: row.name,
          description: row.description ?? null,
          status,
          isActive: row.isActive,
          categoryId: category?.id ?? null,
          brandId: brand?.id ?? null,
          minPriceCents: row.priceCents,
          maxPriceCents: row.priceCents,
        },
      })
    : await prisma.product.create({
        data: {
          sku: row.sku,
          name: row.name,
          slug: productSlug,
          description: row.description ?? null,
          status,
          isActive: row.isActive,
          categoryId: category?.id ?? null,
          brandId: brand?.id ?? null,
          minPriceCents: row.priceCents,
          maxPriceCents: row.priceCents,
        },
      });

  if (Object.keys(attributes).length > 0) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        variants: {
          updateMany: {
            where: {},
            data: { attributes },
          },
        },
      },
    });
  }

  const colors = row.colors.length ? row.colors : [undefined];
  const sizes = row.sizes.length ? row.sizes : [undefined];
  const variants = colors.flatMap((color) => sizes.map((size) => ({ color, size })));

  for (const variant of variants) {
    const sku = variantSku(row.sku, variant.color, variant.size);
    await prisma.productVariant.upsert({
      where: { sku },
      create: {
        productId: product.id,
        sku,
        name: [row.name, variant.color, variant.size].filter(Boolean).join(" - "),
        color: variant.color ?? null,
        size: variant.size ?? null,
        priceCents: row.priceCents,
        stock: row.stock,
        isActive: row.isActive,
        attributes,
      },
      update: {
        productId: product.id,
        name: [row.name, variant.color, variant.size].filter(Boolean).join(" - "),
        color: variant.color ?? null,
        size: variant.size ?? null,
        priceCents: row.priceCents,
        stock: row.stock,
        isActive: row.isActive,
        attributes,
      },
    });
  }

  if (row.images.length) {
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: row.images.map((url, position) => ({
        productId: product.id,
        url,
        alt: row.name,
        position,
      })),
    });
  }

  return {
    row: rowNumber,
    sku: row.sku,
    action: existingProduct ? "updated" as const : "created" as const,
    productId: product.id,
  };
}

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "El archivo CSV es obligatorio." }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "El CSV supera el límite de 2 MB." }, { status: 400 });
  }

  if (file.type && !["text/csv", "application/vnd.ms-excel", "application/csv"].includes(file.type)) {
    return NextResponse.json({ error: "Formato de CSV no válido." }, { status: 400 });
  }

  let parsedRows;
  try {
    parsedRows = parseProductCsv(await file.text());
  } catch {
    return NextResponse.json({ error: "No se ha podido leer el CSV. Revisa separadores, columnas y codificación UTF-8." }, { status: 400 });
  }
  const validationErrors = collectCsvValidationErrors(parsedRows);

  if (validationErrors.length > 0) {
    const importJob = await prisma.importJob.create({
      data: {
        filename: file.name,
        status: "FAILED_VALIDATION",
        rowsTotal: parsedRows.length,
        rowsOk: parsedRows.length - validationErrors.length,
        rowsError: validationErrors.length,
        report: { created: 0, updated: 0, errors: validationErrors, rows: [] } satisfies ImportReport,
      },
    });

    return NextResponse.redirect(new URL(`/admin/imports?job=${importJob.id}`, request.url));
  }

  const validRows = parsedRows
    .filter((row): row is typeof row & { result: { success: true; data: ProductImportRow } } => row.result.success)
    .map((row) => ({ rowNumber: row.rowNumber, data: row.result.data }));

  const report: ImportReport = {
    created: 0,
    updated: 0,
    errors: [],
    rows: [],
  };

  try {
    for (const row of validRows) {
      const result = await importProduct(row.data, row.rowNumber);
      report.rows.push(result);
      if (result.action === "created") report.created += 1;
      if (result.action === "updated") report.updated += 1;
    }

    const importJob = await prisma.importJob.create({
      data: {
        filename: file.name,
        status: "COMPLETED",
        rowsTotal: parsedRows.length,
        rowsOk: parsedRows.length,
        rowsError: 0,
        report,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/imports");

    return NextResponse.redirect(new URL(`/admin/imports?job=${importJob.id}`, request.url));
  } catch (error) {
    const importJob = await prisma.importJob.create({
      data: {
        filename: file.name,
        status: "FAILED_IMPORT",
        rowsTotal: parsedRows.length,
        rowsOk: report.created + report.updated,
        rowsError: 1,
        report: {
          ...report,
          errors: [
            {
              row: 0,
              issues: [{ path: "import", message: error instanceof Error ? error.message : "Error inesperado durante la importación." }],
            },
          ],
        },
      },
    });

    return NextResponse.redirect(new URL(`/admin/imports?job=${importJob.id}`, request.url));
  }
}
