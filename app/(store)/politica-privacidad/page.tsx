import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getPrivacyPolicy } from "@/config/legal-content";
import { getCurrentDictionary, getCurrentLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getCurrentDictionary();

  return {
    title: dictionary.legal.privacyTitle,
    description: dictionary.legal.privacyDescription,
    alternates: { canonical: "/politica-privacidad" },
  };
}

export default async function PrivacyPolicyPage() {
  const locale = await getCurrentLocale();
  const dictionary = await getCurrentDictionary();
  const privacyPolicy = getPrivacyPolicy(locale);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:py-16">
      <Breadcrumbs items={[{ href: "/", label: dictionary.nav.home }, { label: dictionary.legal.privacyTitle }]} />

      <section className="mt-8 border-b border-[var(--line)] pb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{dictionary.legal.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">{dictionary.legal.privacyTitle}</h1>
        <div className="mt-6 grid gap-4 text-lg leading-8 text-[var(--muted)]">
          {privacyPolicy.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-6 text-sm text-[var(--muted)]">{dictionary.legal.updatedAt}: {privacyPolicy.updatedAt}</p>
      </section>

      <section className="grid gap-10 py-10">
        {privacyPolicy.sections.map((section) => (
          <article key={section.title} className="grid gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>

            {"paragraphs" in section &&
              section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-base leading-7 text-[var(--muted)]">
                  {paragraph}
                </p>
              ))}

            {"groups" in section && section.groups ? (
              <div className="grid gap-4">
                {section.groups.map((group) => (
                  <div key={group.title} className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-white p-5">
                    <h3 className="font-semibold">{group.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{group.text}</p>
                  </div>
                ))}
              </div>
            ) : null}

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
          </article>
        ))}
      </section>
    </main>
  );
}
