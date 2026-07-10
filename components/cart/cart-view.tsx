"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingCart } from "lucide-react";
import { formatPriceRange } from "@/lib/catalog/format";

function formatMoney(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(cents / 100);
}

export function CartView() {
  const { items, subtotalCents, totalCents, updateQuantity, removeItem, clearCart } = useCart();
  const [error, setError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  async function checkout() {
    setError("");
    setIsCheckingOut(true);

    try {
      const validation = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })) }),
      });
      const validationResult = await validation.json();

      if (!validation.ok || validationResult.errors?.length) {
        setError(validationResult.errors?.map((item: { message: string }) => item.message).join(" ") || "No se ha podido validar el stock.");
        return;
      }

      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })) }),
      });
      const checkoutResult = await checkoutResponse.json();

      if (!checkoutResponse.ok || !checkoutResult.url) {
        setError(checkoutResult.error ?? "No se ha podido iniciar el pago.");
        return;
      }

      window.location.href = checkoutResult.url;
    } catch {
      setError("No se ha podido conectar con el checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  if (!items.length) {
    return (
      <div className="mt-6">
        <EmptyState
          icon={ShoppingCart}
          title="El carrito todavía está vacío"
          description="Cuando añadas productos, aparecerán aquí con variantes, cantidades y resumen de compra."
        />
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="grid gap-4">
        {items.map((item) => (
          <article key={item.variantId} className="grid gap-4 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-4 sm:grid-cols-[120px_1fr_auto]">
            <Link href={`/product/${item.productSlug}`} className="relative aspect-square overflow-hidden rounded-[var(--radius-sm)] bg-[#efebe3]">
              <Image src={item.image ?? "/images/products/workwear-chaleco-casco.jpg"} alt={item.productName} fill sizes="120px" className="object-cover" />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{item.variantSku}</p>
              <Link href={`/product/${item.productSlug}`} className="mt-2 block text-lg font-semibold hover:text-[var(--accent)]">
                {item.productName}
              </Link>
              <p className="mt-2 text-sm text-[#62615d]">
                {[item.color, item.size].filter(Boolean).join(" · ") || "Variante estándar"}
              </p>
              <p className="mt-3 text-sm font-semibold">{formatPriceRange(item.priceCents, item.priceCents, item.currency)}</p>
              <p className="mt-1 text-xs text-[#62615d]">Stock disponible: {item.stock}</p>
            </div>
            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
              <div className="flex h-10 items-center overflow-hidden rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white">
                <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="grid h-10 w-10 place-items-center hover:bg-[#f7f5f0]" aria-label="Reducir cantidad">
                  <Minus size={14} />
                </button>
                <input
                  aria-label="Cantidad"
                  type="number"
                  min={1}
                  max={item.stock}
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.variantId, Number(event.target.value))}
                  className="h-10 w-14 border-x border-[#d8d1c5] text-center text-sm outline-none"
                />
                <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="grid h-10 w-10 place-items-center hover:bg-[#f7f5f0]" aria-label="Aumentar cantidad">
                  <Plus size={14} />
                </button>
              </div>
              <button type="button" onClick={() => removeItem(item.variantId)} className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
        <h2 className="text-lg font-semibold">Resumen</h2>
        <div className="mt-5 grid gap-3 text-sm text-[#62615d]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío</span>
            <span>Por calcular</span>
          </div>
        </div>
        <div className="mt-5 border-t border-[#eee9df] pt-5">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatMoney(totalCents)}</span>
          </div>
          {error ? <p className="mt-4 rounded-[var(--radius-sm)] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <button
            type="button"
            onClick={checkout}
            disabled={isCheckingOut}
            className="premium-focus mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
          >
            {isCheckingOut ? "Validando stock..." : "Finalizar compra"} <ArrowRight size={17} />
          </button>
          <button type="button" onClick={clearCart} className="mt-3 inline-flex w-full justify-center text-sm font-semibold text-[#62615d] hover:text-red-600">
            Vaciar carrito
          </button>
          <Link href="/catalog" className="mt-4 inline-flex w-full justify-center text-sm font-semibold text-[var(--accent)]">
            Seguir comprando
          </Link>
        </div>
      </aside>
    </div>
  );
}
