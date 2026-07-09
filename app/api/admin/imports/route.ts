import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { parseProductCsv } from "@/lib/csv/products";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "El archivo CSV es obligatorio." }, { status: 400 });
  }

  const parsedRows = parseProductCsv(await file.text());
  const errors = parsedRows
    .filter((row) => !row.result.success)
    .map((row) => ({
      row: row.rowNumber,
      issues:
        row.result.error?.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })) ?? [],
    }));

  const importJob = await prisma.importJob.create({
    data: {
      filename: file.name,
      status: errors.length > 0 ? "FAILED_VALIDATION" : "READY",
      rowsTotal: parsedRows.length,
      rowsOk: parsedRows.length - errors.length,
      rowsError: errors.length,
      report: { errors },
    },
  });

  return NextResponse.redirect(new URL(`/admin/imports?job=${importJob.id}`, request.url));
}
