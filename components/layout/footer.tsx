import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";

type FooterCollection = {
  title: string;
  href: string;
};

export function Footer({
  labels,
  collections,
  contactInfo,
}: {
  labels: Dictionary["footer"];
  collections: FooterCollection[];
  contactInfo: { phone: string; email: string; office: string };
}) {
  return (
    <footer className="border-t border-[#dbe3ec] bg-[#101820] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
        <div>
          <Image
            src="/brand/logo-bogerdpro.png"
            alt="BogerdPro"
            width={181}
            height={98}
            className="h-11 w-auto rounded-sm bg-white object-contain px-2 py-1"
          />
          <p className="mt-4 max-w-md text-sm leading-6 text-white/62">
            {labels.tagline}
          </p>
          <div className="mt-6 grid gap-3 text-sm text-white/70">
            <a href={`tel:${contactInfo.phone.replaceAll(" ", "")}`} className="flex items-center gap-3 transition hover:text-white">
              <Phone size={16} /> {contactInfo.phone}
            </a>
            <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 transition hover:text-white">
              <Mail size={16} /> {contactInfo.email}
            </a>
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 shrink-0" size={16} /> {contactInfo.office}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">{labels.catalogs}</p>
          <div className="mt-4 grid gap-2 text-sm text-white/62">
            {collections.slice(0, 5).map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">{labels.company}</p>
          <div className="mt-4 grid gap-2 text-sm text-white/62">
            <Link href="/#empresa" className="transition hover:text-white">{labels.about}</Link>
            <Link href="/#por-que" className="transition hover:text-white">{labels.why}</Link>
            <Link href="/catalog" className="transition hover:text-white">{labels.products}</Link>
            <Link href="/contacto" className="transition hover:text-white">{labels.contact}</Link>
            <Link href="/condiciones-generales" className="transition hover:text-white">{labels.terms}</Link>
            <Link href="/politica-privacidad" className="transition hover:text-white">{labels.privacy}</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-white/46 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 BogerdPro</p>
          <p>{labels.bottom}</p>
        </div>
      </div>
    </footer>
  );
}
