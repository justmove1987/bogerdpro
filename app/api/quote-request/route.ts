import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prepareCartOrder } from "@/lib/checkout/cart-order";
import { prisma } from "@/lib/db/prisma";
import { sendQuoteRequestEmails } from "@/lib/email/order-emails";
import { createOrderNumber } from "@/lib/orders/number";

const quoteRequestSchema = z.object({
  email: z.string().email().optional(),
  items: z.array(
    z.object({
      variantId: z.string().min(1),
      quantity: z.number().int().positive(),
    }),
  ).min(1),
});

export async function POST(request: Request) {
  const body = quoteRequestSchema.parse(await request.json());
  const session = await getServerSession(authOptions);
  const prepared = await prepareCartOrder(body.items, session?.user?.id);

  if ("error" in prepared) {
    return NextResponse.json({ error: prepared.error }, { status: 400 });
  }

  const customerEmail = session?.user?.email ?? body.email;

  if (!customerEmail) {
    return NextResponse.json({ error: "Inicia sesión o indica un email para enviar la solicitud." }, { status: 401 });
  }

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
          originalUnitCents: item.originalUnitCents,
          discountPercent: item.discountPercent,
          totalCents: item.totalCents,
        })),
      },
    },
    include: { items: true },
  });

  await sendQuoteRequestEmails(order);

  return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber });
}
