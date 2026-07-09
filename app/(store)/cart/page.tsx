import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Carrito",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <Breadcrumbs items={[{ href: "/", label: "Inicio" }, { label: "Carrito" }]} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <h1 className="text-4xl font-semibold tracking-tight">Carrito</h1>
          <div className="mt-6">
            <EmptyState
              icon={ShoppingCart}
              title="El carrito todavía está vacío"
              description="Cuando añadas productos, aparecerán aquí con variantes, cantidades y resumen de compra."
            />
          </div>
        </section>
        <aside className="h-fit rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
          <h2 className="text-lg font-semibold">Resumen</h2>
          <div className="mt-5 grid gap-3 text-sm text-[#62615d]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>0,00 EUR</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>Por calcular</span>
            </div>
          </div>
          <div className="mt-5 border-t border-[#eee9df] pt-5">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>0,00 EUR</span>
            </div>
            <button className="premium-focus mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white opacity-50" disabled>
              Finalizar compra <ArrowRight size={17} />
            </button>
            <Link href="/catalog" className="mt-4 inline-flex w-full justify-center text-sm font-semibold text-[var(--accent)]">
              Seguir comprando
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
