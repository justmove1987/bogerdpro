"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-16">
      <div className="max-w-xl rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-8 text-center">
        <AlertTriangle className="mx-auto text-[var(--accent)]" size={42} />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">Algo no ha ido bien</h1>
        <p className="mt-4 text-sm leading-6 text-[#62615d]">
          Vuelve a intentarlo. Si persiste, el sistema mantendrá el flujo limpio para evitar compras confusas.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="premium-focus mt-7 inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-black"
        >
          <RotateCcw size={17} />
          Reintentar
        </button>
      </div>
    </div>
  );
}
