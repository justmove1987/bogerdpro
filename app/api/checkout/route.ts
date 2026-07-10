import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createOrderNumber } from "@/lib/orders/number";
import { getStripe } from "@/lib/stripe/client";
import { authOptions } from "@/lib/auth/options";

const checkoutSchema = z.object({
  email: z.string().email().optional(),
  items: z.array(
    z.object({
      variantId: z.string().min(1),
      quantity: z.number().int().positive(),
    }),
  ).min(1),
});

export async function POST(request: Request) {
  const body = checkoutSchema.parse(await request.json());
  const session = await getServerSession(authOptions);
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const variantIds = body.items.map((item) => item.variantId);
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

  for (const item of body.items) {
    const variant = variantsById.get(item.variantId);
    if (!variant) {
      return NextResponse.json({ error: "Uno de los productos ya no está disponible." }, { status: 400 });
    }

    if (variant.stock < item.quantity) {
      return NextResponse.json({ error: `${variant.product.name} solo tiene ${variant.stock} unidades disponibles.` }, { status: 400 });
    }
  }

  const currency = variants[0]?.currency ?? "EUR";
  const orderItems = body.items.map((item) => {
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
  const subtotalCents = orderItems.reduce((total, item) => total + item.totalCents, 0);
  const customerEmail = session?.user?.email ?? body.email ?? "pendiente@bogerdpro.local";

  const order = await prisma.order.create({
    data: {
      orderNumber: createOrderNumber(),
      userId: session?.user?.id ?? null,
      email: customerEmail,
      customerName: session?.user?.name ?? null,
      status: "PENDING",
      paymentStatus: "PENDING",
      currency,
      subtotalCents,
      shippingCents: 0,
      taxCents: 0,
      totalCents: subtotalCents,
      items: {
        create: orderItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          unitCents: item.unitCents,
          totalCents: item.totalCents,
        })),
      },
    },
  });

  const stripe = getStripe();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancelled?order=${order.id}`,
    customer_email: customerEmail === "pendiente@bogerdpro.local" ? undefined : customerEmail,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
    },
    line_items: orderItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: item.currency.toLowerCase(),
        unit_amount: item.unitCents,
        product_data: {
          name: item.stripeName,
          metadata: {
            sku: item.sku ?? "",
            variantId: item.variantId ?? "",
          },
        },
      },
    })),
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      stripeCheckoutSession: checkoutSession.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url, orderId: order.id });
}
