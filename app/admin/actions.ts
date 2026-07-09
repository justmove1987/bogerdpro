"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { saveLocalUpload } from "@/lib/uploads/storage";
import { centsToEuros, eurosToCents, formNumber, formString, slugify } from "@/lib/admin/utils";

async function updateProductPriceRange(productId: string) {
  const variants = await prisma.productVariant.findMany({
    where: { productId },
    select: { priceCents: true },
  });

  if (!variants.length) {
    await prisma.product.update({ where: { id: productId }, data: { minPriceCents: null, maxPriceCents: null } });
    return;
  }

  const prices = variants.map((variant) => variant.priceCents);
  await prisma.product.update({
    where: { id: productId },
    data: {
      minPriceCents: Math.min(...prices),
      maxPriceCents: Math.max(...prices),
    },
  });
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();

  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const sku = formString(formData, "sku") || null;
  const description = formString(formData, "description") || null;
  const categoryId = formString(formData, "categoryId") || null;
  const brandId = formString(formData, "brandId") || null;
  const isActive = formData.get("isActive") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const slug = formString(formData, "slug") || slugify(name);

  if (!name || !slug) {
    throw new Error("El nombre del producto es obligatorio.");
  }

  const data = {
    name,
    slug,
    sku,
    description,
    categoryId,
    brandId,
    isActive,
    isFeatured,
    status: isActive ? "ACTIVE" as const : "INACTIVE" as const,
  };

  const product = id
    ? await prisma.product.update({ where: { id }, data })
    : await prisma.product.create({ data });

  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/product/${product.slug}`);
  redirect(`/admin/products/${product.id}`);
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const product = await prisma.product.findUniqueOrThrow({ where: { id }, select: { isActive: true } });
  await prisma.product.update({
    where: { id },
    data: {
      isActive: !product.isActive,
      status: product.isActive ? "INACTIVE" : "ACTIVE",
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  await prisma.product.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function saveVariant(formData: FormData) {
  await requireAdmin();

  const id = formString(formData, "id");
  const productId = formString(formData, "productId");
  const sku = formString(formData, "sku");
  const name = formString(formData, "name") || sku;
  const priceCents = eurosToCents(formNumber(formData, "price"));
  const stock = formNumber(formData, "stock") ?? 0;
  const color = formString(formData, "color") || null;
  const size = formString(formData, "size") || null;
  const isActive = formData.get("isActive") === "on";

  if (!productId || !sku || typeof priceCents !== "number") {
    throw new Error("SKU, producto y precio son obligatorios.");
  }

  if (id) {
    await prisma.productVariant.update({
      where: { id },
      data: { sku, name, priceCents, stock, color, size, isActive },
    });
  } else {
    await prisma.productVariant.create({
      data: { productId, sku, name, priceCents, stock, color, size, isActive },
    });
  }

  await updateProductPriceRange(productId);
  revalidatePath("/");
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariant(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const productId = formString(formData, "productId");
  await prisma.productVariant.delete({ where: { id } });
  await updateProductPriceRange(productId);
  revalidatePath("/");
  revalidatePath(`/admin/products/${productId}`);
}

export async function saveProductImage(formData: FormData) {
  await requireAdmin();
  const productId = formString(formData, "productId");
  const alt = formString(formData, "alt") || null;
  const position = formNumber(formData, "position") ?? 0;
  const urlFromInput = formString(formData, "url");
  const file = formData.get("file");

  let url = urlFromInput;
  if (file instanceof File && file.size > 0) {
    url = await saveLocalUpload(file);
  }

  if (!productId || !url) {
    throw new Error("La imagen es obligatoria.");
  }

  await prisma.productImage.create({
    data: { productId, url, alt, position },
  });
  revalidatePath("/");
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProductImage(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const productId = formString(formData, "productId");
  await prisma.productImage.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath(`/admin/products/${productId}`);
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const slug = formString(formData, "slug") || slugify(name);
  const parentId = formString(formData, "parentId") || null;
  const description = formString(formData, "description") || null;

  if (!name || !slug) throw new Error("Nombre y slug son obligatorios.");

  if (id) {
    await prisma.category.update({ where: { id }, data: { name, slug, parentId, description } });
  } else {
    await prisma.category.create({ data: { name, slug, parentId, description } });
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: formString(formData, "id") } });
  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function saveBrand(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const slug = formString(formData, "slug") || slugify(name);

  if (!name || !slug) throw new Error("Nombre y slug son obligatorios.");

  if (id) {
    await prisma.brand.update({ where: { id }, data: { name, slug } });
  } else {
    await prisma.brand.create({ data: { name, slug } });
  }

  revalidatePath("/");
  revalidatePath("/admin/brands");
}

export async function deleteBrand(formData: FormData) {
  await requireAdmin();
  await prisma.brand.delete({ where: { id: formString(formData, "id") } });
  revalidatePath("/");
  revalidatePath("/admin/brands");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  await prisma.order.update({
    where: { id: formString(formData, "id") },
    data: {
      status: formString(formData, "status") as never,
      paymentStatus: formString(formData, "paymentStatus") as never,
    },
  });
  revalidatePath("/admin/orders");
}

export { centsToEuros };
