import { parse } from "csv-parse/sync";
import { z } from "zod";

const productRowSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  variantSku: z.string().min(1),
  variantName: z.string().default("Default"),
  priceCents: z.coerce.number().int().positive(),
  stock: z.coerce.number().int().nonnegative().default(0),
});

export type ProductImportRow = z.infer<typeof productRowSchema>;

export function parseProductCsv(input: string) {
  const records = parse(input, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((record, index) => ({
    rowNumber: index + 2,
    result: productRowSchema.safeParse(record),
  }));
}
