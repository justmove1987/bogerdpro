import { parse } from "csv-parse/sync";
import { z } from "zod";

const truthyValues = new Set(["1", "true", "yes", "si", "sí", "activo", "active"]);
const falsyValues = new Set(["0", "false", "no", "inactivo", "inactive"]);

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function toList(value: unknown) {
  if (typeof value !== "string") return [];
  return value
    .split(/[|;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string" || !value.trim()) return true;

  const normalized = value.trim().toLowerCase();
  if (truthyValues.has(normalized)) return true;
  if (falsyValues.has(normalized)) return false;

  return value;
}

function toPriceCents(value: unknown) {
  if (typeof value === "number") return Math.round(value * 100);
  if (typeof value !== "string") return value;

  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : value;
}

function normalizeRecord(record: Record<string, unknown>) {
  return {
    sku: record.sku ?? record.SKU,
    name: record.name ?? record.nombre ?? record["nom producte"] ?? record["nombre producto"],
    description: record.description ?? record.descripcion ?? record.descripción,
    category: record.category ?? record.categoria ?? record.categoría,
    subcategory: record.subcategory ?? record.subcategoria ?? record.subcategoría,
    brand: record.brand ?? record.marca,
    priceCents: record.priceCents ?? record.price ?? record.precio ?? record.preu,
    stock: record.stock,
    colors: record.colors ?? record.colores ?? record.colors ?? record.color,
    sizes: record.sizes ?? record.tallas ?? record.talles ?? record.size,
    images: record.images ?? record.imagenes ?? record.imágenes ?? record.imatges ?? record.image,
    attributes: record.attributes ?? record.atributos ?? record.atributs,
    isActive: record.isActive ?? record.active ?? record.activo ?? record.estat ?? record.estado,
  };
}

const productRowSchema = z.object({
  sku: z.string().trim().min(1, "El SKU es obligatorio."),
  name: z.string().trim().min(1, "El nombre del producto es obligatorio."),
  description: z.preprocess(optionalText, z.string().optional()),
  category: z.preprocess(optionalText, z.string().optional()),
  subcategory: z.preprocess(optionalText, z.string().optional()),
  brand: z.preprocess(optionalText, z.string().optional()),
  priceCents: z.preprocess(toPriceCents, z.number().int().positive("El precio debe ser superior a 0.")),
  stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo.").default(0),
  colors: z.preprocess(toList, z.array(z.string())),
  sizes: z.preprocess(toList, z.array(z.string())),
  images: z.preprocess(toList, z.array(z.string())),
  attributes: z.preprocess(optionalText, z.string().optional()),
  isActive: z.preprocess(toBoolean, z.boolean()),
});

export type ProductImportRow = z.infer<typeof productRowSchema>;

export type ParsedProductCsvRow = {
  rowNumber: number;
  raw: Record<string, unknown>;
  result: ReturnType<typeof productRowSchema.safeParse>;
};

export type CsvValidationError = {
  row: number;
  sku?: string;
  issues: Array<{
    path: string;
    message: string;
  }>;
};

export function parseProductCsv(input: string): ParsedProductCsvRow[] {
  const records = parse(input, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, unknown>[];

  return records.map((record, index) => {
    const normalized = normalizeRecord(record);
    return {
      rowNumber: index + 2,
      raw: record,
      result: productRowSchema.safeParse(normalized),
    };
  });
}

export function collectCsvValidationErrors(rows: ParsedProductCsvRow[]) {
  const errors: CsvValidationError[] = rows
    .filter((row) => !row.result.success)
    .map((row) => ({
      row: row.rowNumber,
      sku: typeof row.raw.sku === "string" ? row.raw.sku : undefined,
      issues:
        row.result.error?.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })) ?? [],
    }));

  const seenSkus = new Map<string, number>();
  rows.forEach((row) => {
    if (!row.result.success) return;
    const sku = row.result.data.sku.toLowerCase();
    const previousRow = seenSkus.get(sku);

    if (previousRow) {
      errors.push({
        row: row.rowNumber,
        sku: row.result.data.sku,
        issues: [{ path: "sku", message: `SKU duplicado en el CSV. Ya aparece en la fila ${previousRow}.` }],
      });
      return;
    }

    seenSkus.set(sku, row.rowNumber);
  });

  return errors;
}
