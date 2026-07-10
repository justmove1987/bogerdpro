import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { ProductPurchasePanel } from "@/components/cart/product-purchase-panel";
import { ProductCard } from "@/components/catalog/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { formatPriceRange } from "@/lib/catalog/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog/queries";
import { absoluteUrl, siteName } from "@/lib/seo/site";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function productDescription(product: Awaited<ReturnType<typeof getProductBySlug>>) {
  if (!product) return "";
  return product.description?.slice(0, 155) || `${product.name} de ${product.brand?.name ?? siteName}. Vestuario laboral y EPI profesional.`;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

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
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product);
  const mainImage = product.images[0];
  const totalStock = product.variants.reduce((total, variant) => total + variant.stock, 0);
  const firstVariant = product.variants[0];
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
                availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                url: absoluteUrl(`/product/${product.slug}`),
              }
            : undefined,
        }}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Inicio" },
          { href: "/catalog", label: "Catálogos" },
          ...(product.category ? [{ href: `/catalog?category=${product.category.slug}`, label: product.category.name }] : []),
          { label: product.name },
        ]}
      />
      <div className="mt-8 grid gap-10 lg:grid-cols-[0.96fr_1.04fr]">
        <div className="rounded-[24px] border border-[#e7e2d8] bg-white p-4">
          <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[#efebe3]">
            <Image
              src={mainImage?.url ?? "/images/products/workwear-chaleco-casco.jpg"}
              alt={mainImage?.alt ?? product.name}
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
          </div>
          {product.images.length > 1 ? (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((image) => (
                <div key={image.id} className="relative aspect-square overflow-hidden rounded-[var(--radius-sm)] border border-[#e7e2d8] bg-[#f7f5f0]">
                  <Image src={image.url} alt={image.alt ?? product.name} fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{product.brand?.name ?? "BogerdPro"}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">{product.name}</h1>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-[#d8d1c5] bg-white px-3 py-1 text-[#62615d]">{product.sku ?? product.variants[0]?.sku ?? "-"}</span>
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 font-semibold text-[var(--accent)]">
              {totalStock > 0 ? "En stock" : "Bajo pedido"}
            </span>
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
              priceCents: variant.priceCents,
              currency: variant.currency,
              stock: variant.stock,
            }))}
          />

          <div className="mt-6 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
            <div className="mt-6 overflow-hidden rounded-[var(--radius-sm)] border border-[#e7e2d8]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f7f5f0] text-[#62615d]">
                  <tr>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Color</th>
                    <th className="px-4 py-3">Talla</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => (
                    <tr key={variant.id} className="border-t border-[#e7e2d8]">
                      <td className="px-4 py-3 font-medium">{variant.sku}</td>
                      <td className="px-4 py-3 text-[#62615d]">{variant.color ?? "-"}</td>
                      <td className="px-4 py-3 text-[#62615d]">{variant.size ?? "-"}</td>
                      <td className="px-4 py-3 text-[#62615d]">{variant.stock}</td>
                      <td className="px-4 py-3 font-semibold">{formatPriceRange(variant.priceCents, variant.priceCents, variant.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {Object.keys(attributes).length ? (
            <div className="mt-6 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
              <h2 className="text-lg font-semibold">Características</h2>
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
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">También puede interesarte</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Productos relacionados</h2>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((related) => (
              <ProductCard key={related.slug} product={related} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
