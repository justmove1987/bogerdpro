import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DownloadableCatalogs } from "@/components/catalog/downloadable-catalogs";
import { downloadableCatalogSections } from "@/config/downloadable-catalogs";

const findSection = (slug: string) => downloadableCatalogSections.find((section) => section.slug === slug);

type CatalogSectionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return downloadableCatalogSections.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }: CatalogSectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const section = findSection(slug);

  if (!section) {
    return {
      title: "Catálogos profesionales | BogerdPro",
    };
  }

  return {
    title: `${section.title} | Catálogos BogerdPro`,
    description: section.description,
  };
}

export default async function CatalogSectionPage({ params }: CatalogSectionPageProps) {
  const { slug } = await params;
  const section = findSection(slug);

  if (!section) {
    notFound();
  }

  return (
    <main className="border-b border-[#e7e2d8] bg-[#f7f5f0] pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumbs items={[{ label: "Catálogos", href: "/catalog" }, { label: section.title }]} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-start">
          <div>
            <Link
              href="/catalog"
              className="premium-focus inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-4 py-2 text-sm font-semibold text-[#151515] transition duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <ArrowLeft size={16} />
              Ver todos los catálogos
            </Link>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Catálogos por categoría</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">{section.title}</h1>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d8d1c5] bg-white px-4 py-2 text-sm font-semibold text-[#151515]">
              <Download size={16} className="text-[var(--accent)]" />
              {section.catalogs.length} catálogos disponibles
            </div>
          </div>
          <div className="rounded-[28px] border border-[#e1e8f0] bg-white p-6 shadow-[0_18px_70px_rgb(16_24_32/0.06)] md:p-8">
            <p className="text-base leading-8 text-[#4d5358] md:text-lg">{section.description}</p>
            <div className="mt-5 grid gap-4 text-sm leading-7 text-[#62615d] md:text-base">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <DownloadableCatalogs sectionSlug={section.slug} showSectionIntro={false} />

        <section className="mt-10 rounded-[24px] border border-[#dbe3ec] bg-white p-5 md:p-6">
          <p className="text-sm font-semibold text-[#151515]">Otras categorías</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {downloadableCatalogSections.map((item) => (
              <Link
                key={item.slug}
                href={`/catalog#${item.slug}`}
                aria-current={item.slug === section.slug ? "page" : undefined}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ${
                  item.slug === section.slug
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[#d8d1c5] bg-[#f7f5f0] text-[#62615d] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
