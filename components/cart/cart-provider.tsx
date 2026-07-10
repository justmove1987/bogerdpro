"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  variantId: string;
  productSlug: string;
  productName: string;
  productSku?: string | null;
  variantSku: string;
  image?: string | null;
  color?: string | null;
  size?: string | null;
  priceCents: number;
  currency: string;
  stock: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  totalCents: number;
  addItem: (item: CartItem, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
};

const storageKey = "bogerdpro-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function clampQuantity(quantity: number, stock: number) {
  return Math.max(1, Math.min(Math.floor(quantity), Math.max(1, stock)));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        setItems(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const subtotalCents = items.reduce((total, item) => total + item.priceCents * item.quantity, 0);

    return {
      items,
      count,
      subtotalCents,
      totalCents: subtotalCents,
      addItem(item, quantity = 1) {
        setItems((current) => {
          const existing = current.find((cartItem) => cartItem.variantId === item.variantId);
          if (!existing) {
            return [...current, { ...item, quantity: clampQuantity(quantity, item.stock) }];
          }

          return current.map((cartItem) =>
            cartItem.variantId === item.variantId
              ? {
                  ...cartItem,
                  ...item,
                  quantity: clampQuantity(cartItem.quantity + quantity, item.stock),
                }
              : cartItem,
          );
        });
      },
      updateQuantity(variantId, quantity) {
        setItems((current) =>
          current.map((item) =>
            item.variantId === variantId ? { ...item, quantity: clampQuantity(quantity, item.stock) } : item,
          ),
        );
      },
      removeItem(variantId) {
        setItems((current) => current.filter((item) => item.variantId !== variantId));
      },
      clearCart() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
