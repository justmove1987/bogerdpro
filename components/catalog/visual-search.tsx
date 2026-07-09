"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { Search, ScanLine } from "lucide-react";

export function VisualSearch({ defaultValue = "", actionPath = "/catalog" }: { defaultValue?: string; actionPath?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const query = inputRef.current?.value.trim();

    if (query) {
      params.set("q", query);
    }

    startTransition(() => {
      router.replace(params.toString() ? `${actionPath}?${params.toString()}` : actionPath, { scroll: false });
    });
  }

  return (
    <form onSubmit={handleSubmit} action={actionPath} className="rounded-[var(--radius-md)] border border-[#d8d1c5] bg-white p-2 shadow-[0_16px_50px_rgb(21_21_21/0.08)]">
      <label className="sr-only" htmlFor="catalog-search">
        Buscar producto
      </label>
      <div className="flex items-center gap-2">
        <Search size={22} className="ml-3 shrink-0 text-[var(--accent)]" />
        <input
          id="catalog-search"
          ref={inputRef}
          name="q"
          defaultValue={defaultValue}
          className="premium-focus h-12 min-w-0 flex-1 rounded-[var(--radius-sm)] bg-transparent text-base outline-none placeholder:text-[#8b8880]"
          placeholder="Busca por producto, referencia, sector o catálogo"
        />
        <button className="premium-focus hidden h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-black sm:inline-flex" type="submit">
          <ScanLine size={17} />
          Buscar
        </button>
      </div>
    </form>
  );
}
