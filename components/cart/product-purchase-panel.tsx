"use client";

import { useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatPriceRange } from "@/lib/catalog/format";

type PurchaseVariant = {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  priceCents: number;
  currency: string;
  stock: number;
};

type ProductPurchasePanelProps = {
  product: {
    slug: string;
    name: string;
    sku: string | null;
    image?: string | null;
  };
  variants: PurchaseVariant[];
};

export function ProductPurchasePanel({ product, variants }: ProductPurchasePanelProps) {
  const availableVariants = variants.filter((variant) => variant.stock > 0);
  const firstVariant = availableVariants[0] ?? variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(firstVariant?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? firstVariant;
  const colors = useMemo(() => [...new Set(variants.flatMap((variant) => (variant.color ? [variant.color] : [])))], [variants]);
  const sizes = useMemo(
    () => [...new Set(variants.filter((variant) => !selectedVariant?.color || variant.color === selectedVariant.color).flatMap((variant) => (variant.size ? [variant.size] : [])))],
    [selectedVariant?.color, variants],
  );

  function selectByColor(color: string) {
    const match = variants.find((variant) => variant.color === color && (!selectedVariant?.size || variant.size === selectedVariant.size)) ?? variants.find((variant) => variant.color === color);
    if (match) setSelectedVariantId(match.id);
  }

  function selectBySize(size: string) {
    const match = variants.find((variant) => variant.size === size && (!selectedVariant?.color || variant.color === selectedVariant.color)) ?? variants.find((variant) => variant.size === size);
    if (match) setSelectedVariantId(match.id);
  }

  function handleAdd() {
    if (!selectedVariant || selectedVariant.stock <= 0) return;

    addItem(
      {
        variantId: selectedVariant.id,
        productSlug: product.slug,
        productName: product.name,
        productSku: product.sku,
        variantSku: selectedVariant.sku,
        image: product.image,
        color: selectedVariant.color,
        size: selectedVariant.size,
        priceCents: selectedVariant.priceCents,
        currency: selectedVariant.currency,
        stock: selectedVariant.stock,
        quantity,
      },
      quantity,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="mt-8 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-[#62615d]">Precio profesional</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">
            {selectedVariant ? formatPriceRange(selectedVariant.priceCents, selectedVariant.priceCents, selectedVariant.currency) : "Consultar"}
          </p>
          {selectedVariant ? (
            <p className="mt-2 text-sm text-[#62615d]">
              SKU variante: <span className="font-semibold text-[#151515]">{selectedVariant.sku}</span>
            </p>
          ) : null}
        </div>

        <div className="w-full sm:w-56">
          <label className="text-sm font-semibold" htmlFor="quantity">
            Cantidad
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={selectedVariant?.stock ?? 1}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Math.min(Number(event.target.value), selectedVariant?.stock ?? 1)))}
            className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm"
          />
          <p className="mt-2 text-xs text-[#62615d]">Stock disponible: {selectedVariant?.stock ?? 0}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {colors.length ? (
          <div>
            <p className="text-sm font-semibold">Color</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => selectByColor(color)}
                  className={`premium-focus rounded-full border px-3 py-1 text-sm transition ${
                    selectedVariant?.color === color ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[#d8d1c5] bg-[#f7f5f0] text-[#62615d]"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {sizes.length ? (
          <div>
            <p className="text-sm font-semibold">Talla</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => selectBySize(size)}
                  className={`premium-focus rounded-full border px-3 py-1 text-sm transition ${
                    selectedVariant?.size === size ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[#d8d1c5] bg-[#f7f5f0] text-[#62615d]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!selectedVariant || selectedVariant.stock <= 0}
        className="premium-focus mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgb(21_21_21/0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <ShoppingCart size={18} />
        {added ? "Añadido al carrito" : "Añadir al carrito"}
      </button>
    </div>
  );
}
