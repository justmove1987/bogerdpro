export const doubledPriceBrandSlugs = ["roly", "mukua", "velilla", "vpro"];

type PriceBrand = { slug: string } | null | undefined;

export function customerPriceCents(cents: number, brand: PriceBrand) {
  return cents * (brand && doubledPriceBrandSlugs.includes(brand.slug.trim().toLowerCase()) ? 2 : 1);
}

// Apply once when reading supplier prices for the storefront. Stored prices stay unchanged.
export function withCustomerPrices<T extends {
  brand?: PriceBrand;
  minPriceCents?: number | null;
  maxPriceCents?: number | null;
  variants?: { priceCents: number }[];
}>(product: T): T {
  return {
    ...product,
    ...(typeof product.minPriceCents === "number" ? { minPriceCents: customerPriceCents(product.minPriceCents, product.brand) } : {}),
    ...(typeof product.maxPriceCents === "number" ? { maxPriceCents: customerPriceCents(product.maxPriceCents, product.brand) } : {}),
    ...(product.variants ? { variants: product.variants.map((variant) => ({ ...variant, priceCents: customerPriceCents(variant.priceCents, product.brand) })) } : {}),
  };
}
