import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ProductBrowser } from "@/components/catalog/product-browser";
import { VisualSearch } from "@/components/catalog/visual-search";
import { Reveal } from "@/components/motion/reveal";
import { HeroActionPanel } from "@/components/home/hero-action-panel";
import { catalogCollections, valuePillars } from "@/config/site-content";
import { getCatalogFilters, getCatalogProducts, parseCatalogSearchParams } from "@/lib/catalog/queries";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const homeSearchParams = await searchParams;
  const selected = parseCatalogSearchParams(homeSearchParams);
  const [filters, catalog] = await Promise.all([getCatalogFilters(), getCatalogProducts(selected)]);

  return (
    <div>
      <section className="border-b border-[#e7e2d8] bg-[#f7f5f0]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <Reveal>
            <div className="flex min-h-[520px] flex-col justify-center">
              <p className="inline-flex w-fit rounded-full border border-[#d8d1c5] bg-white px-3 py-1 text-sm font-semibold text-[var(--accent)]">
                Vestuario laboral y EPI para empresas
              </p>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-tight text-[#151515] sm:text-6xl lg:text-7xl">
                Protección, imagen y calidad para tu equipo.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#62615d]">
                Descubre catálogos profesionales con especificaciones técnicas, productos actualizados y soluciones para cada sector.
              </p>
              <div className="mt-8 max-w-2xl">
                <VisualSearch actionPath="/" />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/catalog"
                  className="premium-focus inline-flex h-12 min-w-48 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-6 text-sm font-semibold text-white shadow-[0_16px_36px_rgb(21_21_21/0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-black [&_*]:text-white"
                  style={{ color: "#ffffff" }}
                >
                  <span style={{ color: "#ffffff" }}>Ver catálogos</span>
                  <ArrowRight size={18} color="#ffffff" />
                </Link>
                <Link
                  href="#por-que"
                  className="premium-focus inline-flex h-12 items-center gap-2 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-5 text-sm font-semibold text-[#151515] transition duration-200 hover:-translate-y-0.5 hover:border-[#151515]"
                >
                  Por qué BogerdPro
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <HeroActionPanel />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-[#e7e2d8] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <ProductBrowser
            filters={filters}
            catalog={catalog}
            selected={selected}
            searchParams={homeSearchParams}
            showPagination={false}
            actionPath="/"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-7 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Catálogos</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Colecciones para encontrar antes la solución adecuada</h2>
          <p className="mt-4 text-sm leading-6 text-[#62615d]">
            Acceso directo por familias y sectores para que cualquier empresa llegue al producto correcto con menos fricción.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {catalogCollections.map((item, index) => (
            <Reveal key={item.href} delay={index * 0.02}>
              <Link href={item.href} className="group block h-full overflow-hidden rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--shadow-soft)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#e8edf4]">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
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
                    Ver más <ArrowRight size={15} />
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
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Por qué elegir BogerdPro</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Experiencia, innovación y atención personalizada</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {valuePillars.map((item) => (
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
