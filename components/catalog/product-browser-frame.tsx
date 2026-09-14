"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import type { CatalogFiltersData } from "@/components/catalog/catalog-filters";
import { VisualSearch } from "@/components/catalog/visual-search";
import type { CatalogSearchParams } from "@/lib/catalog/queries";
import type { Dictionary } from "@/lib/i18n/dictionary";

type ProductBrowserFrameProps = {
  filters: CatalogFiltersData;
  selected: CatalogSearchParams;
  searchParams: Record<string, string | string[] | undefined>;
  actionPath: string;
  resultLabel: string;
  labels: {
    catalog: Dictionary["catalog"];
    search: Dictionary["search"];
  };
  children: ReactNode;
};

export function ProductBrowserFrame({ filters, selected, searchParams, actionPath, resultLabel, labels, children }: ProductBrowserFrameProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <CatalogFilters filters={filters} selected={selected} actionPath={actionPath} labels={labels.catalog} onPendingChange={setIsUpdating} />
      <section id="products" className="scroll-mt-24">
        <VisualSearch defaultValue={selected.q} actionPath={actionPath} labels={labels.search} />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[#62615d]">
          <p className="text-sm text-[#62615d]">{resultLabel}</p>
          <form action={actionPath} className="flex items-center gap-2">
            {Object.entries(searchParams).flatMap(([key, value]) => {
              if (key === "sort" || key === "page" || typeof value === "undefined") return [];
              const values = Array.isArray(value) ? value : [value];
              return values.map((item) => <input key={`${key}-${item}`} type="hidden" name={key} value={item} />);
            })}
            <select className="premium-focus h-10 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm" name="sort" defaultValue={selected.sort} aria-label={labels.catalog.sortLabel}>
              <option value="relevance">{labels.catalog.relevance}</option>
              <option value="price-asc">{labels.catalog.priceAsc}</option>
              <option value="price-desc">{labels.catalog.priceDesc}</option>
              <option value="newest">{labels.catalog.newest}</option>
            </select>
            <button className="premium-focus h-10 rounded-[var(--radius-sm)] bg-[#151515] px-3 text-sm font-semibold text-white transition hover:bg-black" type="submit">
              {labels.catalog.apply}
            </button>
          </form>
        </div>
        <div className="relative">
          {isUpdating ? (
            <div className="absolute inset-0 z-10 grid min-h-80 place-items-center rounded-[var(--radius-md)] bg-white/85 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white px-6 py-5 shadow-[var(--shadow-soft)]">
                <div className="relative h-10 w-10">
                  <div className="absolute inset-0 rounded-full border-4 border-[var(--accent-soft)]" />
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[var(--accent)]" />
                </div>
                <p className="text-sm font-semibold text-[#151515]">{labels.catalog.loadingProducts}</p>
              </div>
            </div>
          ) : null}
          {children}
        </div>
      </section>
    </div>
  );
}
