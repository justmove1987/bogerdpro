import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const validateCartSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string().min(1),
      quantity: z.number().int().positive(),
    }),
  ),
});

export async function POST(request: Request) {
  const body = validateCartSchema.parse(await request.json());
  const variantIds = body.items.map((item) => item.variantId);
  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: variantIds },
      isActive: true,
      product: { isActive: true, status: "ACTIVE" },
    },
    include: {
      product: {
        select: { name: true, slug: true },
      },
    },
  });
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));

  const errors = body.items.flatMap((item) => {
    const variant = variantsById.get(item.variantId);
    if (!variant) {
      return [{ variantId: item.variantId, message: "Uno de los productos ya no está disponible." }];
    }

    return [];
  });

  return NextResponse.json({
    ok: errors.length === 0,
    errors,
    items: variants.map((variant) => ({
      variantId: variant.id,
      sku: variant.sku,
      priceCents: variant.priceCents,
      currency: variant.currency,
      productName: variant.product.name,
      productSlug: variant.product.slug,
    })),
  });
}
