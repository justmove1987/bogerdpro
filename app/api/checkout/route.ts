import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prepareCartOrder } from "@/lib/checkout/cart-order";
import { prisma } from "@/lib/db/prisma";
import { createOrderNumber } from "@/lib/orders/number";
import { getStripe } from "@/lib/stripe/client";

const checkoutSchema = z.object({
  email: z.string().email().optional(),
  items: z.array(
    z.object({
      variantId: z.string().min(1),
      quantity: z.number().int().positive().max(99),
    }),
  ).min(1),
});

export async function POST(request: Request) {
  const parsedBody = checkoutSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ error: "El carrito no es válido." }, { status: 400 });
  }

  const body = parsedBody.data;
  const session = await getServerSession(authOptions);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const prepared = await prepareCartOrder(body.items);

  if ("error" in prepared) {
    return NextResponse.json({ error: prepared.error }, { status: 400 });
  }

  const customerEmail = session?.user?.email ?? body.email ?? "pendiente@bogerdpro.local";
  const order = await prisma.order.create({
    data: {
      orderNumber: createOrderNumber(),
      userId: session?.user?.id ?? null,
      email: customerEmail,
      customerName: session?.user?.name ?? null,
      status: "PENDING",
      paymentStatus: "PENDING",
      currency: prepared.currency,
      subtotalCents: prepared.subtotalCents,
      shippingCents: 0,
      taxCents: 0,
      totalCents: prepared.subtotalCents,
      items: {
        create: prepared.items.map((item) => ({
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
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancelled?order=${order.id}`,
    customer_email: customerEmail === "pendiente@bogerdpro.local" ? undefined : customerEmail,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
    },
    payment_intent_data: {
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    },
    line_items: prepared.items.map((item) => ({
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
      stripePaymentIntent: typeof checkoutSession.payment_intent === "string" ? checkoutSession.payment_intent : null,
    },
  });

  return NextResponse.json({ url: checkoutSession.url, orderId: order.id });
}
