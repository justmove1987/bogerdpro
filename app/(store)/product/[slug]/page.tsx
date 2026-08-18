import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Download, FileText } from "lucide-react";
import { ProductPurchasePanel } from "@/components/cart/product-purchase-panel";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog/queries";
import { getCurrentDictionary, getCurrentLocale } from "@/lib/i18n/locale";
import { applyDiscountCents, getCurrentUserBrandDiscounts } from "@/lib/pricing/discounts";
import { absoluteUrl, siteName } from "@/lib/seo/site";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function productDescription(product: Awaited<ReturnType<typeof getProductBySlug>>) {
  if (!product) return "";
  return product.description?.slice(0, 155) || `${product.name} de ${product.brand?.name ?? siteName}. Vestuario laboral y EPI profesional.`;
}

function productSpecs(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const spec = item as { label?: unknown; value?: unknown };
    if (typeof spec.label !== "string" || typeof spec.value !== "string") return [];
    return [{ label: spec.label, value: spec.value }];
  });
}

function documentLabel(type: string, fallback: string, labels: Awaited<ReturnType<typeof getCurrentDictionary>>["product"]) {
  if (type === "SIZE_GUIDE") return labels.sizeGuide;
  if (type === "TECHNICAL_SHEET") return labels.technicalSheet;
  return fallback || labels.technicalDocument;
}

function specValue(specs: { label: string; value: string }[], labels: string[]) {
  const normalizedLabels = labels.map((label) => label.toLowerCase());
  return specs.find((spec) => normalizedLabels.includes(spec.label.toLowerCase()))?.value ?? null;
}

function translatedSpecLabel(label: string, labels: Awaited<ReturnType<typeof getCurrentDictionary>>["product"]) {
  const specLabels = labels.specLabels as Readonly<Record<string, string>>;
  return specLabels[label] ?? label;
}

function translatedSpecValue(label: string, value: string, labels: Awaited<ReturnType<typeof getCurrentDictionary>>["product"]) {
  if (["Género", "Genero", "Gender"].includes(label)) {
    const genderValues = labels.genderValues as Readonly<Record<string, string>>;
    return genderValues[value] ?? value;
  }

  return value;
}

function variantImageUrl(
  productSku: string | null,
  variantSku: string,
  images: { url: string }[],
) {
  const lowerVariantSku = variantSku.toLowerCase();
  const exactMatch = images.find((image) => image.url.toLowerCase().includes(lowerVariantSku));

  if (exactMatch) {
    return exactMatch.url;
  }

  const codes = variantImageCodes(productSku, variantSku);
  return images.find((image) => {
    const url = image.url.toLowerCase();
    return codes.some((code) => imageUrlHasCode(url, code));
  })?.url ?? null;
}

function variantImageCodes(productSku: string | null, variantSku: string) {
  const codes = new Set<string>();
  const sku = variantSku.toLowerCase();
  const product = productSku?.toLowerCase();

  if (product && sku.startsWith(`${product}s`)) {
    const suffix = sku.slice(product.length + 1);
    if (suffix) {
      codes.add(suffix);
      if (suffix.startsWith("1") && suffix.length > 2) {
        codes.add(suffix.slice(1));
      }
    }
  }

  if (product && sku.startsWith(`${product}-`)) {
    const suffix = sku.slice(product.length + 1).split("-")[0];
    if (suffix) codes.add(suffix);
  }

  for (const part of sku.split(/[-_]/)) {
    if (/^\d{2,4}$/.test(part)) {
      codes.add(part);
      if (part.startsWith("1") && part.length > 2) {
        codes.add(part.slice(1));
      }
    }
  }

  return [...codes].sort((a, b) => b.length - a.length);
}

function imageUrlHasCode(url: string, code: string) {
  return [`_${code}_`, `-${code}-`, `_${code}-`, `-${code}_`, `/${code}_`, `/${code}-`].some((token) => url.includes(token));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getCurrentLocale();
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    return {
      title: "Producto no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const image = product.images[0]?.url ?? "/images/products/workwear-chaleco-casco.jpg";
  const description = productDescription(product);

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      type: "website",
      title: `${product.name} | ${siteName}`,
      description,
      url: absoluteUrl(`/product/${product.slug}`),
      images: [{ url: absoluteUrl(image), alt: product.images[0]?.alt ?? product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const locale = await getCurrentLocale();
  const product = await getProductBySlug(slug, locale);
  const dictionary = await getCurrentDictionary();
  const discounts = await getCurrentUserBrandDiscounts();

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product, 3, locale);
  const discountPercent = product.brandId ? discounts[product.brandId] : undefined;
  const mainImage = product.images[0];
  const firstVariant = product.variants[0];
  const specs = productSpecs(product.specifications);
  const gender = specValue(specs, ["Género", "Genero", "Gender"]);
  const attributes = product.attributeValues.reduce<Record<string, string[]>>((groups, item) => {
    const name = item.attributeValue.attribute.name;
    groups[name] = [...(groups[name] ?? []), item.attributeValue.value];
    return groups;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          sku: product.sku ?? firstVariant?.sku,
          brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
          category: product.category?.name,
          description: productDescription(product),
          image: product.images.map((image) => absoluteUrl(image.url)),
          offers: firstVariant
            ? {
                "@type": "Offer",
                priceCurrency: firstVariant.currency,
                price: (firstVariant.priceCents / 100).toFixed(2),
                availability: "https://schema.org/PreOrder",
                url: absoluteUrl(`/product/${product.slug}`),
              }
            : undefined,
        }}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: dictionary.nav.home },
          { href: "/catalog", label: dictionary.catalog.catalogs },
          ...(product.category ? [{ href: `/catalog?category=${product.category.slug}`, label: product.category.name }] : []),
          { label: product.name },
        ]}
      />
      <div className="mt-8 grid gap-10 lg:grid-cols-[0.96fr_1.04fr]">
        <ProductImageGallery
          images={product.images.map((image) => ({ id: image.id, url: image.url, alt: image.alt }))}
          productName={product.name}
          labels={dictionary.product}
        />
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{product.brand?.name ?? "BogerdPro"}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">{product.name}</h1>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-[#d8d1c5] bg-white px-3 py-1 text-[#62615d]">{product.sku ?? product.variants[0]?.sku ?? "-"}</span>
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 font-semibold text-[var(--accent)]">
              {dictionary.catalog.onRequest}
            </span>
            {gender ? <span className="rounded-full border border-[#d8d1c5] bg-white px-3 py-1 text-[#62615d]">{gender}</span> : null}
            {product.category ? <span className="rounded-full border border-[#d8d1c5] bg-white px-3 py-1 text-[#62615d]">{product.category.name}</span> : null}
          </div>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#62615d]">{product.description}</p>

          <ProductPurchasePanel
            product={{
              slug: product.slug,
              name: product.name,
              sku: product.sku,
              image: mainImage?.url ?? "/images/products/workwear-chaleco-casco.jpg",
            }}
            variants={product.variants.map((variant) => ({
              id: variant.id,
              sku: variant.sku,
              color: variant.color,
              size: variant.size,
              imageUrl: variantImageUrl(product.sku, variant.sku, product.images),
              priceCents: applyDiscountCents(variant.priceCents, discountPercent),
              originalPriceCents: discountPercent ? variant.priceCents : null,
              discountPercent: discountPercent ?? null,
              currency: variant.currency,
              stock: variant.stock,
            }))}
            labels={dictionary.product}
          />

          {product.documents.length ? (
            <div className="mt-6 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <FileText size={18} className="text-[var(--accent)]" />
                {dictionary.product.downloads}
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {product.documents.map((document) => (
                  <a
                    key={document.id}
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="premium-focus inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-[#f7f5f0] px-4 text-sm font-semibold text-[#151515] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <Download size={16} />
                    {documentLabel(document.type, document.title, dictionary.product)}
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {specs.length ? (
            <div className="mt-6 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
              <h2 className="text-lg font-semibold">{dictionary.product.details}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {specs.map((spec) => (
                  <div key={`${spec.label}-${spec.value}`} className="rounded-[var(--radius-sm)] bg-[#f7f5f0] p-3 text-sm">
                    <p className="font-semibold">{translatedSpecLabel(spec.label, dictionary.product)}</p>
                    <p className="mt-1 leading-6 text-[#62615d]">{translatedSpecValue(spec.label, spec.value, dictionary.product)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {Object.keys(attributes).length ? (
            <div className="mt-6 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
              <h2 className="text-lg font-semibold">{dictionary.product.features}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(attributes).map(([name, values]) => (
                  <div key={name} className="flex gap-3 rounded-[var(--radius-sm)] bg-[#f7f5f0] p-3 text-sm">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--accent)]" size={16} />
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="mt-1 text-[#62615d]">{values.join(", ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {relatedProducts.length ? (
        <section className="mt-14">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{dictionary.product.relatedEyebrow}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">{dictionary.product.relatedTitle}</h2>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((related) => (
              <ProductCard key={related.slug} product={related} labels={dictionary.catalog} discounts={discounts} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
