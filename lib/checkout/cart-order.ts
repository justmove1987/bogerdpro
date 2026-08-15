import { prisma } from "@/lib/db/prisma";

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

export async function prepareCartOrder(items: CheckoutCartItem[]): Promise<PreparedCartOrder | { error: string }> {
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
        select: { id: true, name: true },
      },
    },
  });
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));

  for (const item of cartItems) {
    const variant = variantsById.get(item.variantId);
    if (!variant) {
      return { error: "Uno de los productos ya no está disponible." };
    }

    if (item.quantity > 99) {
      return { error: "La cantidad máxima por producto es 99 unidades." };
    }

    if (variant.stock < item.quantity) {
      return { error: `${variant.product.name} solo tiene ${variant.stock} unidades disponibles.` };
    }
  }

  const orderItems = cartItems.map((item) => {
    const variant = variantsById.get(item.variantId);
    if (!variant) throw new Error("Variant not found after validation.");
    const variantLabel = [variant.color, variant.size].filter(Boolean).join(" · ");
    const name = variantLabel ? `${variant.product.name} (${variantLabel})` : variant.product.name;

    return {
      productId: variant.product.id,
      variantId: variant.id,
      name,
      sku: variant.sku,
      quantity: item.quantity,
      unitCents: variant.priceCents,
      totalCents: variant.priceCents * item.quantity,
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
