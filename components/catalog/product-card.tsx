import Link from "next/link";
import { ArrowRight, CheckCircle2, ShoppingCart } from "lucide-react";
import { formatPriceRange, formatPrice } from "@/lib/catalog/format";
import { applyDiscountRange, type BrandDiscountMap } from "@/lib/pricing/discounts";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { ProductImagePlaceholder } from "@/components/catalog/product-image-placeholder";
import type { Dictionary } from "@/lib/i18n/dictionary";

export type CatalogProductCard = {
  slug: string;
  name: string;
  sku: string | null;
  description: string | null;
  isFeatured?: boolean;
  minPriceCents?: number | null;
  maxPriceCents?: number | null;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
  images: { url: string; alt: string | null }[];
  variants: { sku?: string; currency: string; stock: number }[];
};

function priceParts(cents?: number | null, currency = "EUR") {
  if (typeof cents !== "number") return null;

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(cents / 100);
}

function PriceAmount({ cents, currency }: { cents?: number | null; currency?: string }) {
  const parts = priceParts(cents, currency);

  if (!parts) {
    return <p className="text-xl font-bold tracking-tight">{formatPrice(cents, currency)}</p>;
  }

  const integer = parts
    .filter((part) => part.type === "integer" || part.type === "group")
    .map((part) => part.value)
    .join("");
  const fraction = parts.find((part) => part.type === "fraction")?.value ?? "00";
  const currencySymbol = parts.find((part) => part.type === "currency")?.value ?? currency ?? "EUR";

  return (
    <p className="flex items-start gap-0.5 tracking-tight text-[#151515]" aria-label={formatPrice(cents, currency)}>
      <span className="text-3xl font-semibold leading-none">{integer}</span>
      <span className="mt-0.5 text-sm font-semibold leading-none">{fraction}</span>
      <span className="mt-0.5 text-sm font-semibold leading-none">{currencySymbol}</span>
    </p>
  );
}

export function ProductCard({ product, labels, discounts = {} }: { product: CatalogProductCard; labels: Dictionary["catalog"]; discounts?: BrandDiscountMap }) {
  const image = product.images[0];
  const firstVariant = product.variants[0];
  const discountPercent = product.brand?.id ? discounts[product.brand.id] : undefined;
  const discountedRange = applyDiscountRange(product.minPriceCents, product.maxPriceCents, discountPercent);

  return (
    <article className="group h-full overflow-hidden rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#cfc6b7] hover:shadow-[var(--shadow-soft)]">
      <Link href={`/product/${product.slug}`} className="premium-focus flex h-full flex-col rounded-[var(--radius-md)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-white">
          {image ? (
            <ImageWithFallback
              src={image.url}
              fallbackSrc="/images/products/product-image-pending.svg"
              alt={image.alt ?? product.name}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <ProductImagePlaceholder label={labels.imagePending} />
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{product.brand?.name ?? "BogerdPro"}</p>
            <p className="text-xs text-[#62615d]">{product.sku ?? product.variants[0]?.sku ?? "-"}</p>
          </div>
          <h3 className="mt-3 line-clamp-3 min-h-[5.25rem] text-lg font-semibold leading-7 text-[#151515]">{product.name}</h3>
          <p className="mt-1 min-h-4 text-xs font-medium uppercase text-[#62615d]">{product.category?.name ?? labels.professionalProduct}</p>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#62615d]">{product.description}</p>
          <div className="mt-auto flex items-end justify-between gap-4 pt-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#8a8174]">PVR</p>
              {discountPercent ? (
                <div className="mt-1">
                  <p className="text-xs font-medium text-[#8a8174] line-through">
                    {formatPriceRange(product.minPriceCents, product.maxPriceCents, firstVariant?.currency)}
                  </p>
                  <PriceAmount cents={discountedRange.min} currency={firstVariant?.currency} />
                  <p className="mt-1 w-fit rounded-full bg-[#eef5ff] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                    {labels.customerDiscount.replace("{percent}", String(discountPercent))}
                  </p>
                </div>
              ) : (
                <PriceAmount cents={product.minPriceCents} currency={firstVariant?.currency} />
              )}
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-sm)] bg-[#151515] text-white transition duration-200 group-hover:scale-105 group-hover:bg-[var(--accent)]">
              <ShoppingCart size={18} />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-[#eee9df] pt-4 text-sm font-medium text-[#151515]">
            <CheckCircle2 size={16} className="text-[var(--accent)]" />
            {labels.viewVariants}
            <ArrowRight size={15} className="transition duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </article>
  );
}
