"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

export function FloatingCart() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label="Abrir carrito"
      className="premium-focus fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#151515] text-white shadow-[var(--shadow-lift)] transition duration-200 hover:-translate-y-1 hover:bg-black md:hidden"
    >
      <ShoppingCart size={22} />
      <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-xs font-bold">
        {count}
      </span>
    </Link>
  );
}
