import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe/client";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().min(1),
      priceCents: z.number().int().positive(),
      quantity: z.number().int().positive(),
    }),
  ),
});

export async function POST(request: Request) {
  const body = checkoutSchema.parse(await request.json());
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${origin}/cart?checkout=success`,
    cancel_url: `${origin}/cart?checkout=cancelled`,
    line_items: body.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "eur",
        unit_amount: item.priceCents,
        product_data: {
          name: item.name,
        },
      },
    })),
  });

  return NextResponse.json({ url: session.url });
}
