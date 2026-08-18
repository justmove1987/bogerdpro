"use client";

import { useEffect } from "react";
import { useRef } from "react";
import { useCart } from "@/components/cart/cart-provider";

export function ClearCartOnMount() {
  const { clearCart } = useCart();
  const hasCleared = useRef(false);

  useEffect(() => {
    if (hasCleared.current) return;
    hasCleared.current = true;
    clearCart();
  }, [clearCart]);

  return null;
}
