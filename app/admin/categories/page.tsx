import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { deleteCategory, saveCategory } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const inputClass = "premium-focus h-10 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
    include: { parent: true, _count: { select: { products: true, children: true } } },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Categorías</h1>
      <p className="mt-2 text-sm text-[#62615d]">Gestiona familias y subcategorías del catálogo.</p>

      <form action={saveCategory} className="mt-6 grid gap-3 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5 md:grid-cols-4">
        <input className={inputClass} name="name" placeholder="Nombre" required />
        <input className={inputClass} name="slug" placeholder="slug-opcional" />
        <select className={inputClass} name="parentId" defaultValue="">
          <option value="">Sin categoría padre</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <input className={inputClass} name="description" placeholder="Descripción breve" />
        <button className="h-10 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white md:col-span-4" type="submit">
          Crear categoría
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-md border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Padre</th>
              <th className="px-4 py-3">Productos</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">
                  <form action={saveCategory} className="grid gap-2 md:grid-cols-2">
                    <input type="hidden" name="id" value={category.id} />
                    <input className={inputClass} name="name" defaultValue={category.name} />
                    <input className={inputClass} name="description" defaultValue={category.description ?? ""} placeholder="Descripción" />
                    <button className="text-left text-xs font-semibold text-[var(--accent)] md:col-span-2" type="submit">Guardar cambios</button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={saveCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <input type="hidden" name="name" value={category.name} />
                    <input type="hidden" name="description" value={category.description ?? ""} />
                    <input className={inputClass} name="slug" defaultValue={category.slug} />
                    <input type="hidden" name="parentId" value={category.parentId ?? ""} />
                  </form>
                </td>
                <td className="px-4 py-3 text-neutral-600">{category.parent?.name ?? "-"}</td>
                <td className="px-4 py-3 text-neutral-600">{category._count.products}</td>
                <td className="px-4 py-3">
                  <form action={deleteCategory} className="flex justify-end">
                    <input type="hidden" name="id" value={category.id} />
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
