import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <Link href="/admin/products" className="text-sm font-semibold text-[var(--accent)]">Volver a productos</Link>
      <h1 className="mt-3 text-3xl font-bold">Crear producto</h1>
      <div className="mt-6">
        <ProductForm categories={categories} brands={brands} />
      </div>
    </div>
  );
}
