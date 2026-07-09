import Link from "next/link";
import { Pencil, Plus, Power, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { deleteProduct, toggleProductActive } from "@/app/admin/actions";
import { centsToEuros } from "@/lib/admin/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { category: true, brand: true, variants: true },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="mt-2 text-sm text-neutral-600">Crea, edita, activa o desactiva productos y gestiona sus variantes.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white transition hover:bg-black [&_*]:text-white"
          style={{ color: "#ffffff" }}
        >
          <Plus size={17} />
          <span style={{ color: "#ffffff" }}>Crear producto</span>
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stock = product.variants.reduce((total, variant) => total + variant.stock, 0);
              return (
                <tr key={product.id} className="border-t border-neutral-100 align-top">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/products/${product.id}`} className="hover:text-[var(--accent)]">{product.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{product.sku ?? "-"}</td>
                  <td className="px-4 py-3 text-neutral-600">{product.category?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-neutral-600">{product.brand?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-neutral-600">{product.minPriceCents ? `${centsToEuros(product.minPriceCents)} €` : "Consultar"}</td>
                  <td className="px-4 py-3 text-neutral-600">{stock}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${product.isActive ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-600"}`}>
                      {product.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link aria-label="Editar" href={`/admin/products/${product.id}`} className="rounded border border-neutral-200 p-2 hover:bg-neutral-50">
                        <Pencil size={15} />
                      </Link>
                      <form action={toggleProductActive}>
                        <input type="hidden" name="id" value={product.id} />
                        <button aria-label="Activar o desactivar" className="rounded border border-neutral-200 p-2 hover:bg-neutral-50" type="submit">
                          <Power size={15} />
                        </button>
                      </form>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button aria-label="Eliminar" className="rounded border border-red-200 p-2 text-red-600 hover:bg-red-50" type="submit">
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-neutral-500" colSpan={8}>
                  Todavía no hay productos. Crea el primero o importa un CSV.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
