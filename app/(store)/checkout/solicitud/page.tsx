import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { getCurrentDictionary } from "@/lib/i18n/locale";

type QuoteRequestSuccessPageProps = {
  searchParams: Promise<{ order?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getCurrentDictionary();

  return {
    title: dictionary.checkout.quoteTitle,
    description: dictionary.checkout.quoteText,
    robots: { index: false, follow: false },
  };
}

export default async function QuoteRequestSuccessPage({ searchParams }: QuoteRequestSuccessPageProps) {
  const params = await searchParams;
  const dictionary = await getCurrentDictionary();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-16">
      <ClearCartOnMount />
      <section className="w-full rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-8 text-center shadow-[var(--shadow-soft)]">
        <CheckCircle2 className="mx-auto text-[var(--accent)]" size={46} />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">{dictionary.checkout.quoteTitle}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#62615d]">
          {dictionary.checkout.quoteText}
        </p>
        {params.order ? (
          <p className="mt-4 rounded-[var(--radius-sm)] bg-[#f7f5f0] px-4 py-3 text-sm font-semibold">
            {dictionary.checkout.reference}: {params.order}
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/cuenta" className="premium-focus inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white" style={{ color: "#ffffff" }}>
            {dictionary.checkout.goAccount}
          </Link>
          <Link href="/" className="premium-focus inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-5 text-sm font-semibold text-[#151515]">
            {dictionary.checkout.backHome}
          </Link>
        </div>
      </section>
    </main>
  );
}
