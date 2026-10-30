import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CategoryForm, DeleteCategoryForm } from "@/components/admin/category-form";
import { categoryPath } from "@/lib/catalog/category-tree";
export const dynamic = "force-dynamic";
export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const category = categories.find((item) => item.id === id);
  if (!category) notFound();
  return <div>
    <Link href="/admin/categories" className="text-sm font-semibold text-[var(--accent)]">Volver a categorías</Link>
    <h1 className="mb-5 mt-3 text-2xl font-bold">{categoryPath(categories, id)}</h1>
    <CategoryForm category={category} categories={categories} />
    <DeleteCategoryForm id={category.id} />
  </div>;
}
