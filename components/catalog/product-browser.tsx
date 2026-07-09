import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { Pagination } from "@/components/catalog/pagination";
import { ProductCard } from "@/components/catalog/product-card";
import { VisualSearch } from "@/components/catalog/visual-search";
import { EmptyState } from "@/components/ui/empty-state";
import type { CatalogSearchParams } from "@/lib/catalog/queries";

type ProductBrowserProps = {
  filters: Parameters<typeof CatalogFilters>[0]["filters"];
  catalog: {
    products: Parameters<typeof ProductCard>[0]["product"][];
    total: number;
    page: number;
    pageCount: number;
    perPage: number;
  };
  selected: CatalogSearchParams;
  searchParams: Record<string, string | string[] | undefined>;
  showPagination?: boolean;
  actionPath?: string;
};

export function ProductBrowser({ filters, catalog, selected, searchParams, showPagination = true, actionPath = "/catalog" }: ProductBrowserProps) {
  const firstItem = catalog.total === 0 ? 0 : (catalog.page - 1) * catalog.perPage + 1;
  const lastItem = Math.min(catalog.total, catalog.page * catalog.perPage);

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <CatalogFilters filters={filters} selected={selected} actionPath={actionPath} />
      <section>
        <VisualSearch defaultValue={selected.q} actionPath={actionPath} />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[#62615d]">
          <p>{catalog.total === 0 ? "0 productos" : `${firstItem}-${lastItem} de ${catalog.total} productos`}</p>
          <form action={actionPath} className="flex items-center gap-2">
            {Object.entries(searchParams).flatMap(([key, value]) => {
              if (key === "sort" || key === "page" || typeof value === "undefined") return [];
              const values = Array.isArray(value) ? value : [value];
              return values.map((item) => <input key={`${key}-${item}`} type="hidden" name={key} value={item} />);
            })}
            <select name="sort" defaultValue={selected.sort} className="premium-focus h-10 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm" aria-label="Ordenar productos">
              <option value="relevance">Ordenar por relevancia</option>
              <option value="price-asc">Precio ascendente</option>
              <option value="price-desc">Precio descendente</option>
              <option value="newest">Novedades</option>
            </select>
            <button className="premium-focus h-10 rounded-[var(--radius-sm)] bg-[#151515] px-3 text-sm font-semibold text-white transition hover:bg-black" type="submit">
              Aplicar
            </button>
          </form>
        </div>
        {catalog.products.length > 0 ? (
          <>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {catalog.products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
            {showPagination ? <Pagination page={catalog.page} pageCount={catalog.pageCount} searchParams={searchParams} /> : null}
          </>
        ) : (
          <div className="mt-6">
            <EmptyState title="No hemos encontrado productos" description="Ajusta los filtros o busca por una referencia alternativa." />
          </div>
        )}
      </section>
    </div>
  );
}
