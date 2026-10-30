"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { sendAccountApprovedEmail } from "@/lib/email/account-emails";
import { saveLocalUpload } from "@/lib/uploads/storage";
import { centsToEuros, eurosToCents, formNumber, formString, slugify } from "@/lib/admin/utils";
import { inferProductCatalogGroups } from "@/lib/catalog/product-catalog-groups";
import { categoryCatalogGroup, categoryDescendants } from "@/lib/catalog/category-tree";
import { catalogGroupKeys, type CatalogGroupKey } from "@/lib/catalog/catalog-groups";

function revalidateCatalog() {
  revalidateTag("catalog", "max");
  revalidatePath("/");
  revalidatePath("/catalog");
}

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

async function imageUrlFromForm(formData: FormData, urlField = "url", fileField = "file") {
  const urlFromInput = formString(formData, urlField);
  const file = formData.get(fileField);

  if (file instanceof File && file.size > 0) {
    return saveLocalUpload(file);
  }

  return urlFromInput;
}

async function createProductImage(formData: FormData) {
  const productId = formString(formData, "productId");
  const alt = formString(formData, "alt") || null;
  const position = formNumber(formData, "position") ?? 0;
  const url = await imageUrlFromForm(formData);

  if (!productId) {
    throw new Error("El producto es obligatorio.");
  }

  if (!url) {
    throw new Error("Añade una imagen por archivo o por URL.");
  }

  await prisma.productImage.create({
    data: { productId, url, alt, position },
  });

  revalidateCatalog();
  revalidatePath(`/admin/products/${productId}`);
}

async function generateProductSku(name: string, currentProductId?: string) {
  const normalizedName = slugify(name).replaceAll("-", "").toUpperCase();
  const base = `BP-${(normalizedName || "PRODUCTO").slice(0, 12)}`;

  for (let index = 0; index < 1000; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const existing = await prisma.product.findFirst({
      where: {
        sku: candidate,
        ...(currentProductId ? { id: { not: currentProductId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  return `BP-${Date.now()}`;
}

async function syncProductCatalogGroups(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      description: true,
      specifications: true,
      categoryId: true,
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true } },
    },
  });

  if (!product) return;

  const categories = await prisma.category.findMany();
  const manualGroup = categoryCatalogGroup(categories, product.categoryId);
  const groups = manualGroup ? [manualGroup] : inferProductCatalogGroups(product);
  await prisma.$transaction([
    prisma.productCatalogGroup.deleteMany({ where: { productId } }),
    ...(groups.length
      ? [
          prisma.productCatalogGroup.createMany({
            data: groups.map((group) => ({ productId, group })),
            skipDuplicates: true,
          }),
        ]
      : []),
  ]);
}

async function syncAllProductCatalogGroups() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      specifications: true,
      categoryId: true,
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true } },
    },
  });

  const categories = await prisma.category.findMany();
  for (const product of products) {
    const manualGroup = categoryCatalogGroup(categories, product.categoryId);
    const groups = manualGroup ? [manualGroup] : inferProductCatalogGroups(product);
    await prisma.$transaction([
      prisma.productCatalogGroup.deleteMany({ where: { productId: product.id } }),
      ...(groups.length
        ? [
            prisma.productCatalogGroup.createMany({
              data: groups.map((group) => ({ productId: product.id, group })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);
  }
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();

  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const sku = formString(formData, "sku") || await generateProductSku(name, id || undefined);
  const description = formString(formData, "description") || null;
  const gender = formString(formData, "gender") || null;
  const material = formString(formData, "material") || null;
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
    gender,
    material,
    categoryId,
    brandId,
    isActive,
    isFeatured,
    status: isActive ? "ACTIVE" as const : "INACTIVE" as const,
  };

  const product = id
    ? await prisma.product.update({ where: { id }, data })
    : await prisma.product.create({ data });

  const initialImageUrl = await imageUrlFromForm(formData, "initialImageUrl", "initialImageFile");
  if (initialImageUrl) {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: initialImageUrl,
        alt: formString(formData, "initialImageAlt") || product.name,
        position: 0,
      },
    });
  }

  await syncProductCatalogGroups(product.id);

  revalidateCatalog();
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
  revalidateCatalog();
  revalidatePath("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  await prisma.product.delete({ where: { id } });
  revalidateCatalog();
  revalidatePath("/admin/products");
}

async function upsertVariant(formData: FormData) {
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

  const duplicatedVariant = await prisma.productVariant.findFirst({
    where: {
      sku,
      ...(id ? { id: { not: id } } : {}),
    },
    select: { id: true },
  });

  if (duplicatedVariant) {
    throw new Error("Ya existe una variante con este SKU. Usa un SKU único.");
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
  revalidateCatalog();
  revalidatePath(`/admin/products/${productId}`);
}

export async function saveVariant(formData: FormData) {
  await requireAdmin();
  await upsertVariant(formData);
}

export type ProductVariantFormState = {
  ok: boolean;
  message: string;
};

export async function saveVariantState(_state: ProductVariantFormState, formData: FormData): Promise<ProductVariantFormState> {
  await requireAdmin();

  try {
    await upsertVariant(formData);
    return { ok: true, message: "Variante guardada correctamente." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se ha podido guardar la variante.",
    };
  }
}

export async function deleteVariant(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const productId = formString(formData, "productId");
  await prisma.productVariant.delete({ where: { id } });
  await updateProductPriceRange(productId);
  revalidateCatalog();
  revalidatePath(`/admin/products/${productId}`);
}

export async function saveProductImage(formData: FormData) {
  await requireAdmin();
  await createProductImage(formData);
}

export async function updateProductImage(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const productId = formString(formData, "productId");
  const url = formString(formData, "url");
  const alt = formString(formData, "alt") || null;
  const position = formNumber(formData, "position") ?? 0;

  if (!id || !productId || !url) {
    throw new Error("Imagen, producto y URL son obligatorios.");
  }

  await prisma.productImage.update({
    where: { id },
    data: { url, alt, position },
  });

  revalidateCatalog();
  revalidatePath(`/admin/products/${productId}`);
}

export type ProductImageFormState = {
  ok: boolean;
  message: string;
};

export async function saveProductImageState(_state: ProductImageFormState, formData: FormData): Promise<ProductImageFormState> {
  await requireAdmin();

  try {
    await createProductImage(formData);
    return { ok: true, message: "Imagen añadida correctamente." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se ha podido añadir la imagen.",
    };
  }
}

export async function deleteProductImage(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const productId = formString(formData, "productId");
  await prisma.productImage.delete({ where: { id } });
  revalidateCatalog();
  revalidatePath(`/admin/products/${productId}`);
}

export type CategoryFormState = { ok: boolean; message: string };

async function syncCategoryProducts(categoryIds: string[]) {
  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany({
    where: { categoryId: { in: categoryIds } },
    include: { category: true, brand: true },
  });
  const rows = products.flatMap((product) => {
    const manual = categoryCatalogGroup(categories, product.categoryId);
    return (manual ? [manual] : inferProductCatalogGroups(product)).map((group) => ({ productId: product.id, group }));
  });
  await prisma.$transaction([
    prisma.productCatalogGroup.deleteMany({ where: { productId: { in: products.map((product) => product.id) } } }),
    prisma.productCatalogGroup.createMany({ data: rows, skipDuplicates: true }),
  ]);
}

export async function saveCategoryState(_previous: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  await requireAdmin();
  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const slug = formString(formData, "slug") || slugify(name);
  const parentId = formString(formData, "parentId") || null;
  const catalogGroup = formString(formData, "catalogGroup") || null;
  const description = formString(formData, "description") || null;
  if (!name || !slug) return { ok: false, message: "Nombre y slug son obligatorios." };
  if (catalogGroup && !catalogGroupKeys.includes(catalogGroup as CatalogGroupKey)) return { ok: false, message: "Selecciona un catálogo válido." };
  const categories = await prisma.category.findMany();
  if (parentId && !categories.some((category) => category.id === parentId)) return { ok: false, message: "La categoría padre ya no existe." };
  if (id && (!categories.some((category) => category.id === id) || (parentId && categoryDescendants(categories, id).has(parentId)))) {
    return { ok: false, message: "No puedes usar la propia categoría ni una de sus subcategorías como padre." };
  }
  if (categories.some((category) => category.slug === slug && category.id !== id)) return { ok: false, message: "Ya existe una categoría con este slug. Usa otro." };
  const category = id
    ? await prisma.category.update({ where: { id }, data: { name, slug, parentId, catalogGroup, description } })
    : await prisma.category.create({ data: { name, slug, parentId, catalogGroup, description } });
  const updated = await prisma.category.findMany();
  await syncCategoryProducts([...categoryDescendants(updated, category.id)]);
  revalidateCatalog();
  revalidatePath("/product/[slug]", "page");
  revalidatePath("/admin/categories", "layout");
  revalidatePath("/admin/products", "layout");
  return { ok: true, message: "Categoría guardada. El catálogo de sus productos se ha actualizado." };
}

export async function deleteCategoryState(_previous: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  await requireAdmin();
  const id = formString(formData, "id");
  const category = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true, children: true } } } });
  if (!category) return { ok: false, message: "La categoría ya no existe." };
  if (category._count.products || category._count.children) return { ok: false, message: "Reasigna sus productos y subcategorías antes de eliminarla." };
  await prisma.category.delete({ where: { id } });
  revalidateCatalog();
  revalidatePath("/admin/categories");
  return { ok: true, message: "Categoría eliminada." };
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

  await syncAllProductCatalogGroups();
  revalidateCatalog();
  revalidatePath("/admin/brands");
}

export async function deleteBrand(formData: FormData) {
  await requireAdmin();
  await prisma.brand.delete({ where: { id: formString(formData, "id") } });
  await syncAllProductCatalogGroups();
  revalidateCatalog();
  revalidatePath("/admin/brands");
}

export async function saveUserProfile(formData: FormData) {
  await requireAdmin();

  const id = formString(formData, "id");
  const name = formString(formData, "name") || null;
  const email = formString(formData, "email").toLowerCase();
  const companyName = formString(formData, "companyName") || null;
  const phone = formString(formData, "phone") || null;
  const taxId = formString(formData, "taxId") || null;

  if (!id || !email) {
    throw new Error("Usuario y email son obligatorios.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: { name, email },
    });

    const customer = await tx.customer.findUnique({ where: { userId: id }, select: { id: true } });

    if (customer) {
      await tx.customer.update({
        where: { id: customer.id },
        data: { email, firstName: name, companyName, phone, taxId },
      });
    } else {
      await tx.customer.upsert({
        where: { email },
        update: { userId: id, email, companyName, phone, taxId },
        create: { userId: id, email, firstName: name, companyName, phone, taxId },
      });
    }
  });

  revalidatePath("/admin/users");
}

export async function approveCustomerAccount(formData: FormData) {
  await requireAdmin();
  const userId = formString(formData, "userId");

  if (!userId) {
    throw new Error("Usuario obligatorio.");
  }

  const approvedAt = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, customer: { select: { id: true, approvedAt: true } } },
  });

  if (!user?.customer) {
    throw new Error("Este usuario no tiene ficha de cliente.");
  }

  if (!user.email) {
    throw new Error("Este usuario no tiene email.");
  }

  await prisma.customer.update({
    where: { id: user.customer.id },
    data: {
      approvedAt: user.customer.approvedAt ?? approvedAt,
    },
  });

  try {
    await sendAccountApprovedEmail({ to: user.email, name: user.name });
    await prisma.customer.update({
      where: { id: user.customer.id },
      data: { approvalEmailSentAt: new Date() },
    });
  } catch (error) {
    console.error("[account-approval-email]", error);
  }

  revalidatePath("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const session = await requireAdmin();
  const id = formString(formData, "id");

  if (!id) {
    throw new Error("Usuario obligatorio.");
  }

  if (session.user.id === id) {
    throw new Error("No puedes borrar tu propio usuario administrador.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.updateMany({ where: { userId: id }, data: { userId: null } });
    await tx.customer.updateMany({ where: { userId: id }, data: { userId: null } });
    await tx.user.delete({ where: { id } });
  });

  revalidatePath("/admin/users");
}

export async function saveUserBrandDiscount(formData: FormData) {
  await requireAdmin();

  const userId = formString(formData, "userId");
  const brandId = formString(formData, "brandId");
  const percent = Math.max(0, Math.min(100, Math.floor(formNumber(formData, "percent") ?? 0)));

  if (!userId || !brandId || percent <= 0) {
    throw new Error("Selecciona usuario, marca y un porcentaje superior a 0.");
  }

  await prisma.userBrandDiscount.upsert({
    where: { userId_brandId: { userId, brandId } },
    update: { percent },
    create: { userId, brandId, percent },
  });

  revalidatePath("/admin/users");
  revalidateCatalog();
}

export async function deleteUserBrandDiscount(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  await prisma.userBrandDiscount.delete({ where: { id } });
  revalidatePath("/admin/users");
  revalidateCatalog();
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  await prisma.order.update({
    where: { id },
    data: {
      status: formString(formData, "status") as never,
      paymentStatus: formString(formData, "paymentStatus") as never,
    },
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export { centsToEuros };
