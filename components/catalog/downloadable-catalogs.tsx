import Image from "next/image";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { downloadableCatalogSections } from "@/config/downloadable-catalogs";

type DownloadableCatalogsProps = {
  sectionSlug?: string;
  showSectionIntro?: boolean;
};

export function DownloadableCatalogs({ sectionSlug, showSectionIntro = true }: DownloadableCatalogsProps) {
  const sections = sectionSlug
    ? downloadableCatalogSections.filter((section) => section.slug === sectionSlug)
    : downloadableCatalogSections;

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className={showSectionIntro ? "mt-14 rounded-[28px] border border-[#dbe3ec] bg-white p-5 shadow-[0_24px_80px_rgb(16_24_32/0.08)] md:p-8" : "mt-12"}>
      {sections.map((section, sectionIndex) => (
        <div
          id={section.slug}
          key={section.slug}
          className={sectionIndex > 0 ? "scroll-mt-24 mt-12 border-t border-[#dbe3ec] pt-12" : "scroll-mt-24"}
        >
          {showSectionIntro ? (
            <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{section.eyebrow}</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">{section.title}</h2>
                <p className="mt-5 text-base leading-7 text-[#62615d]">{section.description}</p>
              </div>
              <div className="grid gap-4 text-sm leading-6 text-[#62615d]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : null}

          <div className={showSectionIntro ? "mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"}>
            {section.catalogs.map((catalog) => (
              <Link
                key={`${section.slug}-${catalog.title}-${catalog.href}`}
                href={catalog.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-[22px] border border-[#e1e8f0] bg-white transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--shadow-soft)]"
              >
                <div className={section.slug === "catalogos-generales" ? "relative aspect-[4/3] overflow-hidden bg-white" : "relative aspect-square overflow-hidden bg-white"}>
                  <Image
                    src={catalog.image}
                    alt={catalog.imageAlt}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={[
                      "transition duration-200",
                      catalog.imageMode === "cover"
                        ? "object-cover"
                        : catalog.imageMode === "contain"
                          ? "object-contain p-8"
                          : "object-contain p-2",
                    ].join(" ")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101820]/22 via-transparent to-transparent opacity-0 transition duration-200 group-hover:opacity-100" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/94 px-3 py-1 text-xs font-semibold text-[#101820] shadow-sm">
                    <FileText size={14} className="text-[var(--accent)]" />
                    PDF
                  </span>
                </div>
                <div className="border-t border-[#e8edf4] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{catalog.brand}</p>
                  <h3 className="mt-2 min-h-12 text-lg font-semibold leading-6">{catalog.title}</h3>
                  {catalog.description ? (
                    <p className="mt-3 text-sm leading-6 text-[#62615d]">{catalog.description}</p>
                  ) : null}
                  <span className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white transition duration-200 group-hover:bg-[var(--accent)]">
                    <Download size={17} />
                    Descargar catálogo
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
