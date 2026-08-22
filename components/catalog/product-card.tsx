import Link from "next/link";
import { ArrowRight, CheckCircle2, ShoppingCart } from "lucide-react";
import { formatPriceRange } from "@/lib/catalog/format";
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

export function ProductCard({ product, labels, discounts = {} }: { product: CatalogProductCard; labels: Dictionary["catalog"]; discounts?: BrandDiscountMap }) {
  const image = product.images[0];
  const firstVariant = product.variants[0];
  const discountPercent = product.brand?.id ? discounts[product.brand.id] : undefined;
  const discountedRange = applyDiscountRange(product.minPriceCents, product.maxPriceCents, discountPercent);

  return (
    <article className="group overflow-hidden rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#cfc6b7] hover:shadow-[var(--shadow-soft)]">
      <Link href={`/product/${product.slug}`} className="premium-focus block rounded-[var(--radius-md)]">
        <div className="relative aspect-[3/3] overflow-hidden bg-[#efebe3]">
          {image ? (
            <>
              <ImageWithFallback
                src={image.url}
                fallbackSrc="/images/products/product-image-pending.svg"
                alt={image.alt ?? product.name}
                fill
                sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            </>
          ) : (
            <ProductImagePlaceholder label={labels.imagePending} />
          )}
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--accent)] shadow-sm">
            {labels.onRequest}
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{product.brand?.name ?? "BogerdPro"}</p>
            <p className="text-xs text-[#62615d]">{product.sku ?? product.variants[0]?.sku ?? "-"}</p>
          </div>
          <h3 className="mt-3 min-h-14 text-lg font-semibold leading-7 text-[#151515]">{product.name}</h3>
          <p className="mt-1 text-xs font-medium text-[#62615d]">{product.category?.name ?? labels.professionalProduct}</p>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#62615d]">{product.description}</p>
          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#62615d]">{labels.fromPrice}</p>
              {discountPercent ? (
                <div className="mt-1">
                  <p className="text-xs font-medium text-[#8a8174] line-through">
                    {formatPriceRange(product.minPriceCents, product.maxPriceCents, firstVariant?.currency)}
                  </p>
                  <p className="text-xl font-bold tracking-tight">
                    {formatPriceRange(discountedRange.min, discountedRange.max, firstVariant?.currency)}
                  </p>
                  <p className="mt-1 w-fit rounded-full bg-[#eef5ff] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                    {labels.customerDiscount.replace("{percent}", String(discountPercent))}
                  </p>
                </div>
              ) : (
                <p className="text-xl font-bold tracking-tight">
                  {formatPriceRange(product.minPriceCents, product.maxPriceCents, firstVariant?.currency)}
                </p>
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
