import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";

type QuoteRequestSuccessPageProps = {
  searchParams: Promise<{ order?: string }>;
};

export const metadata = {
  title: "Solicitud enviada",
  description: "Solicitud de comanda B2B enviada correctamente a BogerdPro.",
};

export default async function QuoteRequestSuccessPage({ searchParams }: QuoteRequestSuccessPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-16">
      <ClearCartOnMount />
      <section className="w-full rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-8 text-center shadow-[var(--shadow-soft)]">
        <CheckCircle2 className="mx-auto text-[var(--accent)]" size={46} />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">Solicitud enviada</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#62615d]">
          Hemos recibido tu solicitud. El equipo de BogerdPro revisará productos, cantidades y condiciones especiales antes de confirmar la comanda.
        </p>
        {params.order ? (
          <p className="mt-4 rounded-[var(--radius-sm)] bg-[#f7f5f0] px-4 py-3 text-sm font-semibold">
            Referencia: {params.order}
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/cuenta" className="premium-focus inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white" style={{ color: "#ffffff" }}>
            Ir a mi cuenta
          </Link>
          <Link href="/" className="premium-focus inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-5 text-sm font-semibold text-[#151515]">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
