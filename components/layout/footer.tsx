import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { catalogCollections, contactInfo } from "@/config/site-content";

export function Footer() {
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
            Vestuario laboral y equipos de protección individual para empresas que necesitan seguridad, imagen y fiabilidad.
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
          <p className="text-sm font-semibold">Catálogos</p>
          <div className="mt-4 grid gap-2 text-sm text-white/62">
            {catalogCollections.slice(0, 5).map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Empresa</p>
          <div className="mt-4 grid gap-2 text-sm text-white/62">
            <Link href="/#empresa" className="transition hover:text-white">Sobre nosotros</Link>
            <Link href="/#por-que" className="transition hover:text-white">Por qué elegirnos</Link>
            <Link href="/catalog" className="transition hover:text-white">Productos</Link>
            <Link href="/contacto" className="transition hover:text-white">Contacto</Link>
            <Link href="/condiciones-generales" className="transition hover:text-white">Condiciones Generales</Link>
            <Link href="/politica-privacidad" className="transition hover:text-white">Política de Privacidad</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-white/46 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 BogerdPro</p>
          <p>Experiencia, calidad, protección e imagen profesional.</p>
        </div>
      </div>
    </footer>
  );
}
