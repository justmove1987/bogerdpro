import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";

export const metadata = {
  title: "Pago correcto",
};

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <ClearCartOnMount />
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-50 text-green-700">
        <CheckCircle2 size={34} />
      </div>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight">Pago realizado correctamente</h1>
      <p className="mt-4 text-base leading-7 text-[#62615d]">
        Hemos recibido la confirmación de Stripe. Tu pedido queda registrado y pasará a preparación.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/cuenta" className="premium-focus inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white" style={{ color: "#ffffff" }}>
          Ver mi cuenta
        </Link>
        <Link href="/" className="premium-focus inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-5 text-sm font-semibold">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
