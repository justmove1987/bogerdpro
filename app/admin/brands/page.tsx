import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { deleteBrand, saveBrand } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const inputClass = "premium-focus h-10 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Marcas</h1>
      <p className="mt-2 text-sm text-[#62615d]">Gestiona marcas y fabricantes asociados a productos.</p>

      <form action={saveBrand} className="mt-6 grid gap-3 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5 md:grid-cols-[1fr_1fr_auto]">
        <input className={inputClass} name="name" placeholder="Nombre de marca" required />
        <input className={inputClass} name="slug" placeholder="slug-opcional" />
        <button className="h-10 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white" type="submit">
          Crear marca
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-md border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Productos</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">
                  <form action={saveBrand} className="flex gap-2">
                    <input type="hidden" name="id" value={brand.id} />
                    <input className={inputClass} name="name" defaultValue={brand.name} />
                    <input type="hidden" name="slug" value={brand.slug} />
                    <button className="text-xs font-semibold text-[var(--accent)]" type="submit">Guardar</button>
                  </form>
                </td>
                <td className="px-4 py-3 text-neutral-600">{brand.slug}</td>
                <td className="px-4 py-3 text-neutral-600">{brand._count.products}</td>
                <td className="px-4 py-3">
                  <form action={deleteBrand} className="flex justify-end">
                    <input type="hidden" name="id" value={brand.id} />
                    <button className="rounded border border-red-200 p-2 text-red-600 hover:bg-red-50" type="submit">
                      <Trash2 size={15} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
