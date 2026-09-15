import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil, Plus, Power, Search, Trash2, X } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { deleteProduct, toggleProductActive } from "@/app/admin/actions";
import { centsToEuros } from "@/lib/admin/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type AdminProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function adminProductsHref(page: number, query: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = (await searchParams) ?? {};
  const query = (firstParam(params.q) ?? "").trim();
  const requestedPage = Number(firstParam(params.page) ?? "1");
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;
  const where: Prisma.ProductWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
          { brand: { name: { contains: query, mode: "insensitive" } } },
          { variants: { some: { sku: { contains: query, mode: "insensitive" } } } },
        ],
      }
    : {};

  const [products, totalProducts] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: true, brand: true, variants: true },
    }),
    prisma.product.count({ where }),
  ]);
  const pageCount = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const visibleFrom = totalProducts === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const visibleTo = Math.min(page * PAGE_SIZE, totalProducts);
  const hasPrevious = page > 1;
  const hasNext = page < pageCount;

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

      <form action="/admin/products" className="mt-6 flex flex-col gap-3 rounded-md border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar productos</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar por nombre, SKU, marca o categoría"
            className="h-11 w-full rounded-[var(--radius-sm)] border border-neutral-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#151515]"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white transition hover:bg-black"
        >
          Buscar
        </button>
        {query ? (
          <Link
            href="/admin/products"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            <X size={16} />
            Limpiar
          </Link>
        ) : null}
      </form>

      <div className="mt-4 flex flex-col gap-2 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Mostrando {visibleFrom}-{visibleTo} de {totalProducts} productos
          {query ? ` para "${query}"` : ""}
        </p>
        <p>Página {Math.min(page, pageCount)} de {pageCount}</p>
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
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              return (
                <tr key={product.id} className="border-t border-neutral-100 align-top">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/products/${product.id}`} className="hover:text-[var(--accent)]">{product.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{product.sku ?? "-"}</td>
                  <td className="px-4 py-3 text-neutral-600">{product.category?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-neutral-600">{product.brand?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-neutral-600">{product.minPriceCents ? `${centsToEuros(product.minPriceCents)} €` : "Consultar"}</td>
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
                <td className="px-4 py-8 text-center text-neutral-500" colSpan={7}>
                  {query ? "No se han encontrado productos con esta búsqueda." : "Todavía no hay productos. Crea el primero o importa un CSV."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {pageCount > 1 ? (
        <nav aria-label="Paginación de productos" className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href={adminProductsHref(Math.max(1, page - 1), query)}
            aria-disabled={!hasPrevious}
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-neutral-200 bg-white px-3 text-sm font-semibold transition hover:bg-neutral-50 aria-disabled:pointer-events-none aria-disabled:opacity-45"
          >
            <ChevronLeft size={16} />
            Anterior
          </Link>
          <span className="px-3 text-sm text-neutral-600">
            {page} / {pageCount}
          </span>
          <Link
            href={adminProductsHref(Math.min(pageCount, page + 1), query)}
            aria-disabled={!hasNext}
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-neutral-200 bg-white px-3 text-sm font-semibold transition hover:bg-neutral-50 aria-disabled:pointer-events-none aria-disabled:opacity-45"
          >
            Siguiente
            <ChevronRight size={16} />
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
