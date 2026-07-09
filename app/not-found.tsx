import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-16">
      <div className="max-w-xl text-center">
        <SearchX className="mx-auto text-[var(--accent)]" size={42} />
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">No hemos encontrado esta página</h1>
        <p className="mt-4 text-sm leading-6 text-[#62615d]">
          Puedes volver al catálogo y buscar por referencia, sector o disponibilidad.
        </p>
        <Link href="/catalog" className="premium-focus mt-7 inline-flex h-12 items-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-black">
          Abrir catálogo <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}
