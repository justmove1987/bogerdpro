import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type AdminImportsPageProps = {
  searchParams?: Promise<{
    job?: string;
  }>;
};

type ImportReport = {
  created?: number;
  updated?: number;
  errors?: Array<{
    row: number;
    sku?: string;
    issues: Array<{
      path: string;
      message: string;
    }>;
  }>;
  rows?: Array<{
    row: number;
    sku: string;
    action: "created" | "updated";
  }>;
};

function asImportReport(value: unknown): ImportReport {
  if (!value || typeof value !== "object") return {};
  return value as ImportReport;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    COMPLETED: "Completada",
    FAILED_VALIDATION: "Errores de validación",
    FAILED_IMPORT: "Error de importación",
    READY: "Lista",
    PENDING: "Pendiente",
  };

  return labels[status] ?? status;
}

export default async function AdminImportsPage({ searchParams }: AdminImportsPageProps) {
  const params = await searchParams;
  const imports = await prisma.importJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const selectedJob = params?.job ? imports.find((item) => item.id === params.job) ?? null : imports[0] ?? null;
  const report = asImportReport(selectedJob?.report);
  const errors = report.errors ?? [];
  const importedRows = report.rows ?? [];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Importación CSV</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            Importa productos, variantes, imágenes, categorías y marcas desde un CSV. Si el SKU ya existe, se actualizará.
          </p>
        </div>
        <Link href="/examples/product-import-example.csv" className="inline-flex h-10 items-center justify-center rounded-[var(--radius-sm)] border border-neutral-300 bg-white px-4 text-sm font-semibold hover:border-neutral-950">
          Descargar CSV ejemplo
        </Link>
      </div>

      <form action="/api/admin/imports" method="post" encType="multipart/form-data" className="mt-6 rounded-md border border-neutral-200 bg-white p-5">
        <label className="block text-sm font-semibold" htmlFor="file">
          Archivo CSV de productos
        </label>
        <p className="mt-2 text-sm text-neutral-600">
          Campos aceptados: SKU, nombre, descripción, categoría, subcategoría, marca, precio, stock, colores, tallas, imágenes, atributos y estado activo/inactivo.
        </p>
        <input id="file" name="file" type="file" accept=".csv,text/csv" className="mt-4 block w-full text-sm" required />
        <button className="mt-4 rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800" type="submit">
          Validar e importar
        </button>
      </form>

      {selectedJob ? (
        <section className="mt-6 rounded-md border border-neutral-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Resumen de la última importación</h2>
              <p className="mt-1 text-sm text-neutral-600">{selectedJob.filename}</p>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
              {statusLabel(selectedJob.status)}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-5">
            <div className="rounded-md border border-neutral-200 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Filas</p>
              <p className="mt-1 text-2xl font-bold">{selectedJob.rowsTotal}</p>
            </div>
            <div className="rounded-md border border-neutral-200 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">OK</p>
              <p className="mt-1 text-2xl font-bold">{selectedJob.rowsOk}</p>
            </div>
            <div className="rounded-md border border-neutral-200 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Creados</p>
              <p className="mt-1 text-2xl font-bold">{report.created ?? 0}</p>
            </div>
            <div className="rounded-md border border-neutral-200 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Actualizados</p>
              <p className="mt-1 text-2xl font-bold">{report.updated ?? 0}</p>
            </div>
            <div className="rounded-md border border-neutral-200 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Errores</p>
              <p className="mt-1 text-2xl font-bold">{selectedJob.rowsError}</p>
            </div>
          </div>

          {errors.length ? (
            <div className="mt-6 overflow-hidden rounded-md border border-red-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-red-50 text-red-800">
                  <tr>
                    <th className="px-4 py-3">Fila</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Errores</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map((error, index) => (
                    <tr key={`${error.row}-${index}`} className="border-t border-red-100">
                      <td className="px-4 py-3">{error.row || "-"}</td>
                      <td className="px-4 py-3">{error.sku ?? "-"}</td>
                      <td className="px-4 py-3 text-red-700">
                        {error.issues.map((issue) => `${issue.path}: ${issue.message}`).join(" · ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {importedRows.length ? (
            <div className="mt-6 overflow-hidden rounded-md border border-neutral-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-600">
                  <tr>
                    <th className="px-4 py-3">Fila</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {importedRows.slice(0, 50).map((row) => (
                    <tr key={`${row.row}-${row.sku}`} className="border-t border-neutral-100">
                      <td className="px-4 py-3">{row.row}</td>
                      <td className="px-4 py-3 font-medium">{row.sku}</td>
                      <td className="px-4 py-3 text-neutral-600">{row.action === "created" ? "Creado" : "Actualizado"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importedRows.length > 50 ? <p className="border-t border-neutral-100 px-4 py-3 text-sm text-neutral-500">Se muestran las primeras 50 filas importadas.</p> : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-md border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3">Archivo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Filas</th>
              <th className="px-4 py-3">OK</th>
              <th className="px-4 py-3">Errores</th>
            </tr>
          </thead>
          <tbody>
            {imports.map((item) => (
              <tr key={item.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/imports?job=${item.id}`} className="hover:text-[var(--accent)]">
                    {item.filename}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600">{statusLabel(item.status)}</td>
                <td className="px-4 py-3 text-neutral-600">{item.rowsTotal}</td>
                <td className="px-4 py-3 text-neutral-600">{item.rowsOk}</td>
                <td className="px-4 py-3 text-neutral-600">{item.rowsError}</td>
              </tr>
            ))}
            {imports.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-neutral-500" colSpan={5}>
                  Todavía no hay importaciones.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
