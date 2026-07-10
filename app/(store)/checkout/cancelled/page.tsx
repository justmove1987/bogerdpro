import Link from "next/link";
import { XCircle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";

export const metadata = {
  title: "Pago cancelado",
};

type CheckoutCancelledPageProps = {
  searchParams?: Promise<{
    order?: string;
  }>;
};

export default async function CheckoutCancelledPage({ searchParams }: CheckoutCancelledPageProps) {
  const params = await searchParams;
  if (params?.order) {
    await prisma.order.updateMany({
      where: {
        id: params.order,
        paymentStatus: "PENDING",
      },
      data: {
        status: "CANCELLED",
        paymentStatus: "FAILED",
      },
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-700">
        <XCircle size={34} />
      </div>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight">Pago cancelado</h1>
      <p className="mt-4 text-base leading-7 text-[#62615d]">
        No se ha realizado ningún cargo. Puedes volver al carrito, revisar los productos y finalizar la compra cuando quieras.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/cart" className="premium-focus inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white" style={{ color: "#ffffff" }}>
          Volver al carrito
        </Link>
        <Link href="/" className="premium-focus inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-5 text-sm font-semibold">
          Seguir comprando
        </Link>
      </div>
    </main>
  );
}
