import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { generateInvoicePdf } from "@/lib/invoices/invoice-pdf";

type InvoiceRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: InvoiceRouteProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id && !session?.user?.email) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: [
        ...(session.user.id ? [{ userId: session.user.id }] : []),
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Factura no encontrada." }, { status: 404 });
  }

  if (order.paymentStatus !== "PAID" && order.status !== "FULFILLED") {
    return NextResponse.json({ error: "La factura estará disponible cuando la comanda esté pagada o enviada." }, { status: 403 });
  }

  const pdf = await generateInvoicePdf(order);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="factura-${order.orderNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
