import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ProductBrowser } from "@/components/catalog/product-browser";
import { Reveal } from "@/components/motion/reveal";
import { getSiteContent } from "@/config/site-content";
import { getCatalogFiltersForSearch, getCatalogProducts, parseCatalogSearchParams } from "@/lib/catalog/queries";
import { getCurrentDictionary, getCurrentLocale } from "@/lib/i18n/locale";
import { getCurrentUserBrandDiscounts } from "@/lib/pricing/discounts";
import { absoluteUrl, defaultSeo, siteName } from "@/lib/seo/site";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Vestuario laboral y EPI para empresas",
  description: defaultSeo.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: defaultSeo.title,
    description: defaultSeo.description,
    url: absoluteUrl("/"),
    siteName,
    images: [{ url: absoluteUrl(defaultSeo.image), alt: "BogerdPro vestuario laboral y EPI" }],
  },
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const homeSearchParams = await searchParams;
  const selected = parseCatalogSearchParams(homeSearchParams);
  const locale = await getCurrentLocale();
  const filters = await getCatalogFiltersForSearch(selected, locale);
  const catalog = await getCatalogProducts(selected, locale);
  const discounts = await getCurrentUserBrandDiscounts();
  const dictionary = await getCurrentDictionary();
  const siteContent = getSiteContent(locale);

  return (
    <div>
      <section className="relative isolate flex min-h-[calc(70svh-72px)] overflow-hidden border-b border-[#e7e2d8] bg-[#151515] text-white sm:min-h-[calc(70svh-76px)]">
        <Image
          src="/images/catalogs/construccion-alta-visibilidad.jpg"
          alt={dictionary.home.heroImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[52%_46%]"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,#111_0%,transparent_100%)] opacity-70" />

        <div className="relative mx-auto flex w-full max-w-7xl items-end px-4 pb-10 pt-24 sm:px-6 sm:pb-14 lg:pb-16">
          <Reveal>
            <div className="max-w-3xl">
              <p className="inline-flex w-fit rounded-full border border-white/25 bg-white/12 px-3 py-1 text-sm font-semibold text-white shadow-sm backdrop-blur">
                {dictionary.home.eyebrow}
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
                {dictionary.home.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/86 sm:text-lg sm:leading-8">
                {dictionary.home.text}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="#products"
                  className="premium-focus inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-white px-6 text-sm font-semibold text-[#151515] shadow-[0_18px_44px_rgb(0_0_0/0.26)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f6f2ea] [&_*]:text-[#151515]"
                  style={{ color: "#151515" }}
                >
                  <span style={{ color: "#151515" }}>{dictionary.home.viewProducts}</span>
                  <ArrowRight size={18} color="#151515" />
                </Link>
                <Link
                  href="/catalog"
                  className="premium-focus inline-flex h-12 items-center gap-2 rounded-[var(--radius-sm)] border border-white/28 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/18"
                >
                  {dictionary.home.viewCatalogs}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-[#e7e2d8] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <ProductBrowser
            filters={filters}
            catalog={catalog}
            selected={selected}
            searchParams={homeSearchParams}
            actionPath="/"
            discounts={discounts}
            labels={{ catalog: dictionary.catalog, search: dictionary.search }}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-7 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{dictionary.catalog.catalogs}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">{dictionary.catalog.introTitle}</h2>
          <p className="mt-4 text-sm leading-6 text-[#62615d]">
            {dictionary.catalog.introText}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {siteContent.catalogCollections.map((item, index) => (
            <Reveal key={item.href} delay={index * 0.02}>
              <Link href={item.href} className="group block h-full overflow-hidden rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--shadow-soft)]">
                <div className="relative aspect-[5/4] overflow-hidden bg-[#e8edf4]">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-[center_34%] transition duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-[var(--radius-sm)] bg-white/92 text-[var(--accent)] shadow-sm">
                    <item.icon size={21} />
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="mt-5 text-lg font-semibold leading-6">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#62615d]">{item.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#151515] transition group-hover:text-[var(--accent)]">
                    {dictionary.catalog.viewMore} <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="por-que" className="bg-[#f7f5f0]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-7 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{dictionary.catalog.whyEyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">{dictionary.catalog.whyTitle}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {siteContent.valuePillars.map((item) => (
              <div key={item.title} className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
                <ShieldCheck className="text-[var(--accent)]" size={23} />
                <h3 className="mt-5 text-base font-semibold leading-6">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#62615d]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
