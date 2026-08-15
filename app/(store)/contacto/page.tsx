import Link from "next/link";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { contactInfo } from "@/config/site-content";
import { getCurrentDictionary } from "@/lib/i18n/locale";

export const metadata = {
  title: "Contacto | BogerdPro",
  description: "Contacta con BogerdPro para solicitar asesoramiento, catálogos o presupuesto de vestuario laboral y EPI.",
};

type ContactLabels = Awaited<ReturnType<typeof getCurrentDictionary>>["contact"];

function contactCards(labels: ContactLabels) {
  return [
  {
    title: labels.phone,
    text: labels.phoneText,
    value: contactInfo.phone,
    href: `tel:${contactInfo.phone.replaceAll(" ", "")}`,
    icon: Phone,
  },
  {
    title: labels.email,
    text: labels.emailText,
    value: contactInfo.email,
    href: `mailto:${contactInfo.email}`,
    icon: Mail,
  },
  {
    title: labels.office,
    text: labels.officeText,
    value: contactInfo.office,
    href: "https://maps.google.com/?q=Av.%20Montgo%2068%20B%2C%2017130%20L%27Escala%2C%20Girona%2C%20Espana",
    icon: MapPin,
  },
  ];
}

export default async function ContactPage() {
  const dictionary = await getCurrentDictionary();
  const cards = contactCards(dictionary.contact);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <Breadcrumbs items={[{ href: "/", label: dictionary.nav.home }, { label: dictionary.contact.breadcrumb }]} />

      <section className="mt-8 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{dictionary.contact.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            {dictionary.contact.heading}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#62615d] md:text-lg">
            {dictionary.contact.text}
          </p>

          <div className="mt-8 grid gap-4">
            {cards.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex gap-4 rounded-[var(--radius-md)] border border-[#e1e8f0] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[var(--shadow-soft)]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)]">
                  <item.icon size={20} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[#151515]">{item.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-[#62615d]">{item.text}</span>
                  <span className="mt-2 block text-sm font-semibold text-[#151515] group-hover:text-[var(--accent)]">
                    {item.value}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <section className="rounded-[28px] border border-[#dbe3ec] bg-white p-5 shadow-[0_24px_80px_rgb(16_24_32/0.08)] md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{dictionary.contact.request}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{dictionary.contact.formTitle}</h2>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-sm)] bg-[#151515] text-white">
              <Send size={18} />
            </span>
          </div>

          <ContactForm labels={dictionary.contact} />
        </section>
      </section>
    </main>
  );
}
