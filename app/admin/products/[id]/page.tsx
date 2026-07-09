import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type ProductEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/products" className="text-sm font-semibold text-[var(--accent)]">Volver a productos</Link>
      <h1 className="mt-3 text-3xl font-bold">Editar producto</h1>
      <p className="mt-2 text-sm text-[#62615d]">{product.name}</p>
      <div className="mt-6">
        <ProductForm product={product} categories={categories} brands={brands} />
      </div>
    </div>
  );
}
