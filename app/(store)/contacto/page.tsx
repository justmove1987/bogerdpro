import Link from "next/link";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { contactInfo } from "@/config/site-content";

export const metadata = {
  title: "Contacto | BogerdPro",
  description: "Contacta con BogerdPro para solicitar asesoramiento, catálogos o presupuesto de vestuario laboral y EPI.",
};

const contactCards = [
  {
    title: "Teléfono",
    text: "Estamos disponibles de lunes a viernes.",
    value: contactInfo.phone,
    href: `tel:${contactInfo.phone.replaceAll(" ", "")}`,
    icon: Phone,
  },
  {
    title: "Correo electrónico",
    text: "Resolvemos tus dudas también por email.",
    value: contactInfo.email,
    href: `mailto:${contactInfo.email}`,
    icon: Mail,
  },
  {
    title: "Oficinas",
    text: "Atención profesional desde L'Escala, Girona.",
    value: contactInfo.office,
    href: "https://maps.google.com/?q=Av.%20Montgo%2068%20B%2C%2017130%20L%27Escala%2C%20Girona%2C%20Espana",
    icon: MapPin,
  },
];

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <Breadcrumbs items={[{ href: "/", label: "Inicio" }, { label: "Contacto" }]} />

      <section className="mt-8 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Contacto profesional</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Hablemos de lo que necesita tu equipo.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#62615d] md:text-lg">
            Te ayudamos a seleccionar vestuario laboral, equipos de protección individual, catálogos y soluciones de
            personalización para tu empresa.
          </p>

          <div className="mt-8 grid gap-4">
            {contactCards.map((item) => (
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
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Solicitud</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Pide información</h2>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-sm)] bg-[#151515] text-white">
              <Send size={18} />
            </span>
          </div>

          <form className="mt-7 grid gap-4" aria-label="Formulario de contacto">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#151515]">
                Nombre
                <input className="premium-focus h-12 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-[#f8fafc] px-4 text-sm font-normal" placeholder="Nombre y apellidos" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#151515]">
                Empresa
                <input className="premium-focus h-12 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-[#f8fafc] px-4 text-sm font-normal" placeholder="Nombre de la empresa" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#151515]">
                Email
                <input type="email" className="premium-focus h-12 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-[#f8fafc] px-4 text-sm font-normal" placeholder="empresa@email.com" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#151515]">
                Teléfono
                <input className="premium-focus h-12 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-[#f8fafc] px-4 text-sm font-normal" placeholder="+34" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-[#151515]">
              Mensaje
              <textarea className="premium-focus min-h-36 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-[#f8fafc] px-4 py-3 text-sm font-normal leading-6" placeholder="Cuéntanos qué productos, sector o catálogos necesitas." />
            </label>
            <button
              type="button"
              className="premium-focus mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)]"
            >
              <Send size={17} />
              Enviar solicitud
            </button>
            <p className="text-xs leading-5 text-[#62615d]">
              Formulario mock para la Etapa 1. La conexión real se añadirá en una fase posterior.
            </p>
          </form>
        </section>
      </section>
    </main>
  );
}
