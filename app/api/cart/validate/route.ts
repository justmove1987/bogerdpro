import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { applyDiscountCents, normalizeDiscountPercent } from "@/lib/pricing/discounts";

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
  const session = await getServerSession(authOptions);
  const variantIds = body.items.map((item) => item.variantId);
  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: variantIds },
      isActive: true,
      product: { isActive: true, status: "ACTIVE" },
    },
    include: {
      product: {
        select: { name: true, slug: true, brandId: true },
      },
    },
  });
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  const brandIds = [...new Set(variants.flatMap((variant) => (variant.product.brandId ? [variant.product.brandId] : [])))];
  const discounts = session?.user?.id
    ? await prisma.userBrandDiscount.findMany({
        where: { userId: session.user.id, brandId: { in: brandIds } },
        select: { brandId: true, percent: true },
      })
    : [];
  const discountsByBrandId = new Map(discounts.map((discount) => [discount.brandId, normalizeDiscountPercent(discount.percent)]));

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
    items: variants.map((variant) => {
      const discountPercent = variant.product.brandId ? discountsByBrandId.get(variant.product.brandId) ?? null : null;

      return {
        variantId: variant.id,
        sku: variant.sku,
        priceCents: applyDiscountCents(variant.priceCents, discountPercent),
        originalPriceCents: discountPercent ? variant.priceCents : null,
        discountPercent,
        currency: variant.currency,
        productName: variant.product.name,
        productSlug: variant.product.slug,
      };
    }),
  });
}
