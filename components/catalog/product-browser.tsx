import { Pagination } from "@/components/catalog/pagination";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductBrowserFrame } from "@/components/catalog/product-browser-frame";
import { EmptyState } from "@/components/ui/empty-state";
import type { CatalogFiltersData } from "@/components/catalog/catalog-filters";
import type { CatalogSearchParams } from "@/lib/catalog/queries";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { BrandDiscountMap } from "@/lib/pricing/discounts";

type ProductBrowserProps = {
  filters: CatalogFiltersData;
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
  discounts?: BrandDiscountMap;
  labels: {
    catalog: Dictionary["catalog"];
    search: Dictionary["search"];
  };
};

export function ProductBrowser({ filters, catalog, selected, searchParams, showPagination = true, actionPath = "/catalog", discounts = {}, labels }: ProductBrowserProps) {
  const firstItem = catalog.total === 0 ? 0 : (catalog.page - 1) * catalog.perPage + 1;
  const lastItem = Math.min(catalog.total, catalog.page * catalog.perPage);

  return (
    <ProductBrowserFrame
      filters={filters}
      selected={selected}
      searchParams={searchParams}
      actionPath={actionPath}
      resultLabel={catalog.total === 0 ? `0 ${labels.catalog.count}` : `${firstItem}-${lastItem} ${labels.catalog.countOf} ${catalog.total} ${labels.catalog.count}`}
      labels={labels}
    >
      {catalog.products.length > 0 ? (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {catalog.products.map((product) => (
              <ProductCard key={product.slug} product={product} labels={labels.catalog} discounts={discounts} />
            ))}
          </div>
          {showPagination ? <Pagination page={catalog.page} pageCount={catalog.pageCount} searchParams={searchParams} basePath={actionPath} hash="products" labels={labels.catalog} /> : null}
        </>
      ) : (
        <div className="mt-6">
          <EmptyState title={labels.catalog.noProductsTitle} description={labels.catalog.noProductsText} />
        </div>
      )}
    </ProductBrowserFrame>
  );
}
