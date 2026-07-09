import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { generalTerms } from "@/config/legal-content";

export const metadata: Metadata = {
  title: "Condiciones Generales",
  description: "Condiciones generales de venta de BogerdPro.",
};

export default function GeneralTermsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:py-16">
      <Breadcrumbs items={[{ href: "/", label: "Inicio" }, { label: generalTerms.title }]} />

      <section className="mt-8 border-b border-[var(--line)] pb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Legal</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">{generalTerms.title}</h1>
        <div className="mt-6 grid gap-4 text-lg leading-8 text-[var(--muted)]">
          {generalTerms.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-6 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white p-5 text-sm leading-6 text-[var(--muted)]">
          {generalTerms.company.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>

      <section className="grid gap-10 py-10">
        {generalTerms.sections.map((section) => (
          <article key={section.title} className="grid gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="text-base leading-7 text-[var(--muted)]">
                {paragraph}
              </p>
            ))}

            {"items" in section && section.items ? (
              <ul className="grid gap-2 text-base leading-7 text-[var(--muted)]">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {"closing" in section && section.closing ? (
              <p className="text-base leading-7 text-[var(--muted)]">{section.closing}</p>
            ) : null}

            {section.title === "22. Protección de datos" ? (
              <Link href="/politica-privacidad" className="text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--ink)]">
                Ver Política de Privacidad
              </Link>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
