import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { CategoryForm } from "@/components/admin/category-form";
import { categoryPath } from "@/lib/catalog/category-tree";
export const dynamic = "force-dynamic";
export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true, children: true } } } });
  const ordered = [...categories].sort((a, b) => categoryPath(categories, a.id).localeCompare(categoryPath(categories, b.id), "es"));
  return <div>
    <h1 className="text-3xl font-bold">Categorías y subcategorías</h1>
    <p className="mt-2 text-sm text-neutral-600">Organiza tus categorías y vincúlalas a los catálogos de la tienda. Asigna los productos desde su ficha de administración.</p>
    <h2 className="mb-3 mt-6 text-lg font-semibold">Crear categoría</h2>
    <CategoryForm categories={categories} />
    <div className="mt-6 space-y-3">{ordered.map((category) => <div key={category.id} className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-sm font-semibold">{categoryPath(categories, category.id)} <span className="font-normal text-neutral-500">({category._count.products} productos · {category._count.children} subcategorías)</span></div>
      <Link href={`/admin/categories/${category.id}`} className="mt-2 inline-block text-sm font-semibold text-[var(--accent)]">Editar categoría</Link>
    </div>)}</div>
  </div>;
}
