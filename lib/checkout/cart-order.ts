import { prisma } from "@/lib/db/prisma";
import { formatDisplayTitle } from "@/lib/catalog/format";
import { applyDiscountCents, normalizeDiscountPercent } from "@/lib/pricing/discounts";

export type CheckoutCartItem = {
  variantId: string;
  quantity: number;
};

export type PreparedOrderItem = {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  quantity: number;
  unitCents: number;
  originalUnitCents: number;
  discountPercent: number | null;
  totalCents: number;
  currency: string;
  stripeName: string;
};

export type PreparedCartOrder = {
  currency: string;
  subtotalCents: number;
  items: PreparedOrderItem[];
};

function aggregateCartItems(items: CheckoutCartItem[]) {
  const itemsByVariantId = new Map<string, number>();

  for (const item of items) {
    itemsByVariantId.set(item.variantId, (itemsByVariantId.get(item.variantId) ?? 0) + item.quantity);
  }

  return [...itemsByVariantId.entries()].map(([variantId, quantity]) => ({ variantId, quantity }));
}

export async function prepareCartOrder(items: CheckoutCartItem[], userId?: string | null): Promise<PreparedCartOrder | { error: string }> {
  const cartItems = aggregateCartItems(items);
  const variantIds = cartItems.map((item) => item.variantId);
  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: variantIds },
      isActive: true,
      product: { isActive: true, status: "ACTIVE" },
    },
    include: {
      product: {
        select: { id: true, name: true, brandId: true },
      },
    },
  });
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  const brandIds = [...new Set(variants.flatMap((variant) => (variant.product.brandId ? [variant.product.brandId] : [])))];
  const discounts = userId
    ? await prisma.userBrandDiscount.findMany({
        where: { userId, brandId: { in: brandIds } },
        select: { brandId: true, percent: true },
      })
    : [];
  const discountsByBrandId = new Map(discounts.map((discount) => [discount.brandId, normalizeDiscountPercent(discount.percent)]));

  for (const item of cartItems) {
    const variant = variantsById.get(item.variantId);
    if (!variant) {
      return { error: "Uno de los productos ya no está disponible." };
    }

    if (item.quantity > 99) {
      return { error: "La cantidad máxima por producto es 99 unidades." };
    }

  }

  const orderItems = cartItems.map((item) => {
    const variant = variantsById.get(item.variantId);
    if (!variant) throw new Error("Variant not found after validation.");
    const variantLabel = [variant.color, variant.size].filter(Boolean).join(" · ");
    const productName = formatDisplayTitle(variant.product.name) ?? variant.product.name;
    const name = variantLabel ? `${productName} (${variantLabel})` : productName;
    const discountPercent = variant.product.brandId ? discountsByBrandId.get(variant.product.brandId) ?? null : null;
    const unitCents = applyDiscountCents(variant.priceCents, discountPercent);

    return {
      productId: variant.product.id,
      variantId: variant.id,
      name,
      sku: variant.sku,
      quantity: item.quantity,
      unitCents,
      originalUnitCents: variant.priceCents,
      discountPercent,
      totalCents: unitCents * item.quantity,
      currency: variant.currency,
      stripeName: name,
    };
  });

  return {
    currency: orderItems[0]?.currency ?? "EUR",
    subtotalCents: orderItems.reduce((total, item) => total + item.totalCents, 0),
    items: orderItems,
  };
}
