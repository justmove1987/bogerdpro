"use client";

import { ShoppingCart } from "lucide-react";

export function AddToCartButton({ productSlug }: { productSlug: string }) {
  return (
    <button
      type="button"
      onClick={() => console.log("Add to cart", productSlug)}
      className="premium-focus inline-flex h-12 items-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgb(21_21_21/0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)] active:translate-y-0"
    >
      <ShoppingCart size={18} />
      Añadir al carrito
    </button>
  );
}
