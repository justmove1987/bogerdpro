import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminImportsPage() {
  const imports = await prisma.importJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Importación CSV</h1>
      <form action="/api/admin/imports" method="post" encType="multipart/form-data" className="mt-6 rounded-md border border-neutral-200 bg-white p-5">
        <label className="block text-sm font-semibold" htmlFor="file">
          Archivo CSV de productos
        </label>
        <input id="file" name="file" type="file" accept=".csv,text/csv" className="mt-3 block w-full text-sm" />
        <button className="mt-4 rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800" type="submit">
          Importar
        </button>
      </form>
      <div className="mt-6 overflow-hidden rounded-md border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3">Archivo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Filas</th>
              <th className="px-4 py-3">OK</th>
              <th className="px-4 py-3">Errors</th>
            </tr>
          </thead>
          <tbody>
            {imports.map((item) => (
              <tr key={item.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium">{item.filename}</td>
                <td className="px-4 py-3 text-neutral-600">{item.status}</td>
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
