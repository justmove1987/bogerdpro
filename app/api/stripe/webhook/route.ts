import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { getStripe } from "@/lib/stripe/client";
import { sendOrderPaidEmails } from "@/lib/email/order-emails";

export const runtime = "nodejs";

async function markOrderAsPaid(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    throw new Error("Stripe session is missing orderId metadata.");
  }

  const paidOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }

    if (order.paymentStatus === "PAID") {
      return order;
    }

    for (const item of order.items) {
      if (!item.variantId) continue;

      const updated = await tx.productVariant.updateMany({
        where: {
          id: item.variantId,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (updated.count !== 1) {
        throw new Error(`Not enough stock for variant ${item.variantId}.`);
      }
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentStatus: "PAID",
        email: session.customer_details?.email ?? order.email,
        customerName: session.customer_details?.name ?? order.customerName,
        stripeCheckoutSession: session.id,
        stripePaymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
      },
      include: { items: true },
    });
  });

  await sendOrderPaidEmails(paidOrder);
}

async function markOrderAsFailed(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  await prisma.order.updateMany({
    where: {
      id: orderId,
      paymentStatus: "PENDING",
    },
    data: {
      paymentStatus: "FAILED",
    },
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is required." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const stripe = getStripe();
  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid Stripe webhook." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await markOrderAsPaid(event.data.object);
    }

    if (event.type === "checkout.session.expired") {
      await markOrderAsFailed(event.data.object);
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
