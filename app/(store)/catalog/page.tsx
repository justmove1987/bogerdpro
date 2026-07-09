import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { DownloadableCatalogs } from "@/components/catalog/downloadable-catalogs";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { catalogCollections } from "@/config/site-content";

export const metadata = {
  title: "Catálogos",
};

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <Breadcrumbs items={[{ href: "/", label: "Inicio" }, { label: "Catálogos" }]} />
      <div className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Vestuario laboral y EPI</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Catálogos</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#62615d]">
          Selecciona una colección para consultar y descargar catálogos profesionales por marca, sector y tipo de producto.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {catalogCollections.map((item) => (
          <Link key={item.href} href={item.href} className="group overflow-hidden rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--shadow-soft)]">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#e8edf4]">
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent" />
              <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] bg-white/92 text-[var(--accent)] shadow-sm">
                <item.icon size={20} />
              </span>
            </div>
            <div className="p-5">
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#62615d]">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#151515] group-hover:text-[var(--accent)]">
                Ver más <ArrowRight size={15} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <DownloadableCatalogs />
    </div>
  );
}
