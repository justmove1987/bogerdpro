import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [products, activeProducts, categories, brands, orders, pendingOrders, imports] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.importJob.count(),
  ]);

  const cards = [
    { label: "Productos", value: products, detail: `${activeProducts} activos`, href: "/admin/products" },
    { label: "Categorías", value: categories, detail: "Familias y subfamilias", href: "/admin/categories" },
    { label: "Marcas", value: brands, detail: "Fabricantes y proveedores", href: "/admin/brands" },
    { label: "Pedidos", value: orders, detail: `${pendingOrders} pendientes`, href: "/admin/orders" },
    { label: "Imports CSV", value: imports, detail: "Historial de importaciones", href: "/admin/imports" },
  ];

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Operativa</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Panel de administración</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#62615d]">
        Gestiona productos, variantes, stock, precios, catálogos y pedidos desde un panel sencillo para el día a día.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((item) => (
          <Link key={item.label} href={item.href} className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[var(--shadow-soft)]">
            <p className="text-sm text-[#62615d]">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
            <p className="mt-2 text-xs font-medium text-[#62615d]">{item.detail}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
