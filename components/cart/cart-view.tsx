"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, FileText, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { formatPriceRange } from "@/lib/catalog/format";
import type { Dictionary } from "@/lib/i18n/dictionary";

function formatMoney(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(cents / 100);
}

function cartPayload(items: ReturnType<typeof useCart>["items"]) {
  return { items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })) };
}

export function CartView({ labels }: { labels: Dictionary["cart"] & Pick<Dictionary["product"], "standardVariant"> }) {
  const { items, subtotalCents, totalCents, updateQuantity, removeItem, clearCart } = useCart();
  const [error, setError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isRequestingQuote, setIsRequestingQuote] = useState(false);

  async function checkout() {
    setError("");
    setIsCheckingOut(true);

    try {
      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartPayload(items)),
      });
      const checkoutResult = await checkoutResponse.json();

      if (!checkoutResponse.ok || !checkoutResult.url) {
        setError(checkoutResult.error ?? labels.checkoutError);
        return;
      }

      window.location.href = checkoutResult.url;
    } catch {
      setError(labels.checkoutConnectError);
    } finally {
      setIsCheckingOut(false);
    }
  }

  async function requestQuote() {
    setError("");
    setIsRequestingQuote(true);

    try {
      const response = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartPayload(items)),
      });
      const result = await response.json();

      if (!response.ok || !result.orderNumber) {
        setError(result.error ?? labels.quoteError);
        return;
      }

      window.location.href = `/checkout/solicitud?order=${encodeURIComponent(result.orderNumber)}`;
    } catch {
      setError(labels.quoteError);
    } finally {
      setIsRequestingQuote(false);
    }
  }

  if (!items.length) {
    return (
      <div className="mt-6">
        <EmptyState
          icon={ShoppingCart}
          title={labels.emptyTitle}
          description={labels.emptyText}
        />
      </div>
    );
  }

  const isBusy = isCheckingOut || isRequestingQuote;

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="grid gap-4">
        {items.map((item) => (
          <article key={item.variantId} className="grid gap-4 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-4 sm:grid-cols-[120px_1fr_auto]">
            <Link href={`/product/${item.productSlug}`} className="relative aspect-square overflow-hidden rounded-[var(--radius-sm)] bg-[#efebe3]">
              <ImageWithFallback src={item.image ?? "/images/products/workwear-chaleco-casco.jpg"} fallbackSrc="/images/products/workwear-chaleco-casco.jpg" alt={item.productName} fill sizes="120px" className="object-cover" />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{item.variantSku}</p>
              <Link href={`/product/${item.productSlug}`} className="mt-2 block text-lg font-semibold hover:text-[var(--accent)]">
                {item.productName}
              </Link>
              <p className="mt-2 text-sm text-[#62615d]">
                {[item.color, item.size].filter(Boolean).join(" · ") || labels.standardVariant}
              </p>
              <div className="mt-3">
                {item.discountPercent && item.originalPriceCents ? (
                  <p className="text-xs font-medium text-[#8a8174] line-through">
                    {formatPriceRange(item.originalPriceCents, item.originalPriceCents, item.currency)}
                  </p>
                ) : null}
                <p className="text-sm font-semibold">{formatPriceRange(item.priceCents, item.priceCents, item.currency)}</p>
                {item.discountPercent ? (
                  <p className="mt-1 w-fit rounded-full bg-[#eef5ff] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                    {labels.customerDiscount.replace("{percent}", String(item.discountPercent))}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
              <div className="flex h-10 items-center overflow-hidden rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white">
                <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="grid h-10 w-10 place-items-center hover:bg-[#f7f5f0]" aria-label={labels.decrease}>
                  <Minus size={14} />
                </button>
                <input
                  aria-label={labels.quantity}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.variantId, Number(event.target.value))}
                  className="h-10 w-14 border-x border-[#d8d1c5] text-center text-sm outline-none"
                />
                <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="grid h-10 w-10 place-items-center hover:bg-[#f7f5f0]" aria-label={labels.increase}>
                  <Plus size={14} />
                </button>
              </div>
              <button type="button" onClick={() => removeItem(item.variantId)} className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">
                <Trash2 size={16} />
                {labels.remove}
              </button>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
        <h2 className="text-lg font-semibold">{labels.summary}</h2>
        <div className="mt-5 grid gap-3 text-sm text-[#62615d]">
          <div className="flex justify-between">
            <span>{labels.subtotal}</span>
            <span>{formatMoney(subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span>{labels.shipping}</span>
            <span>{labels.shippingPending}</span>
          </div>
        </div>
        <div className="mt-5 border-t border-[#eee9df] pt-5">
          <div className="flex justify-between text-lg font-bold">
            <span>{labels.totalBase}</span>
            <span>{formatMoney(totalCents)}</span>
          </div>
          {error ? <p className="mt-4 rounded-[var(--radius-sm)] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <button
            type="button"
            onClick={checkout}
            disabled={isBusy}
            className="premium-focus mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
            style={{ color: "#ffffff" }}
          >
            <span style={{ color: "#ffffff" }}>{isCheckingOut ? labels.redirecting : labels.pay}</span>
            <ArrowRight size={17} color="#ffffff" />
          </button>
          <button
            type="button"
            onClick={requestQuote}
            disabled={isBusy}
            className="premium-focus mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-5 text-sm font-semibold text-[#151515] transition hover:-translate-y-0.5 hover:border-[var(--accent)] disabled:opacity-50"
          >
            <FileText size={17} />
            {isRequestingQuote ? labels.requestingQuote : labels.requestQuote}
          </button>
          <p className="mt-3 text-xs leading-5 text-[#62615d]">
            {labels.quoteText}
          </p>
          <button type="button" onClick={clearCart} className="mt-4 inline-flex w-full justify-center text-sm font-semibold text-[#62615d] hover:text-red-600">
            {labels.clear}
          </button>
          <Link href="/catalog" className="mt-4 inline-flex w-full justify-center text-sm font-semibold text-[var(--accent)]">
            {labels.keepShopping}
          </Link>
        </div>
      </aside>
    </div>
  );
}
