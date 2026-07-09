"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { CatalogSearchParams } from "@/lib/catalog/queries";

type CatalogFiltersData = {
  categories: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    _count: { products: number };
  }[];
  brands: {
    name: string;
    slug: string;
    _count: { products: number };
  }[];
  colors: string[];
  sizes: string[];
  attributes: {
    name: string;
    slug: string;
    values: { value: string; slug: string }[];
  }[];
};

function isSelected(values: string[] | undefined, value: string) {
  return values?.includes(value) ?? false;
}

function selectedCount(values?: string[]) {
  return values?.length ?? 0;
}

function FilterGroup({
  title,
  count = 0,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <details open={count > 0} className="group rounded-[var(--radius-sm)] border border-[#e7e2d8] bg-white">
      <summary className="premium-focus flex cursor-pointer list-none items-center justify-between gap-3 rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold text-[#151515] transition hover:bg-[#f7f5f0] [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span className="flex items-center gap-2">
          {count > 0 ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-bold text-white">
              {count}
            </span>
          ) : null}
          <ChevronDown size={16} className="text-[#62615d] transition duration-200 group-open:rotate-180" />
        </span>
      </summary>
      <div className="border-t border-[#eee9df] px-2 py-2">{children}</div>
    </details>
  );
}

function CheckboxFilter({
  name,
  value,
  label,
  checked,
  count,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-2 py-2 text-sm text-[#62615d] transition hover:bg-[#f7f5f0] hover:text-[#151515]">
      <input className="h-4 w-4 accent-[var(--accent)]" name={name} value={value} defaultChecked={checked} type="checkbox" />
      <span className="flex-1">{label}</span>
      {typeof count === "number" ? <span className="text-xs text-[#8b8880]">{count}</span> : null}
    </label>
  );
}

export function CatalogFilters({
  filters,
  selected,
  actionPath = "/catalog",
}: {
  filters: CatalogFiltersData;
  selected: CatalogSearchParams;
  actionPath?: string;
}) {
  const parentCategories = filters.categories.filter((category) => !category.parentId);
  const childCategories = filters.categories.filter((category) => category.parentId);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const priceCount = Number(typeof selected.minPrice === "number") + Number(typeof selected.maxPrice === "number");
  const totalSelected =
    selectedCount(selected.category) +
    selectedCount(selected.brand) +
    selectedCount(selected.color) +
    selectedCount(selected.size) +
    selectedCount(selected.attribute) +
    priceCount;

  function applyFilters() {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      const stringValue = String(value).trim();
      if (stringValue) {
        params.append(key, stringValue);
      }
    }

    params.delete("page");
    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${actionPath}?${query}` : actionPath, { scroll: false });
    });
  }

  return (
    <aside className="h-fit rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-4">
      <form ref={formRef} action={actionPath} onChange={applyFilters}>
        {selected.q ? <input type="hidden" name="q" value={selected.q} /> : null}
        {selected.sort !== "relevance" ? <input type="hidden" name="sort" value={selected.sort} /> : null}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Filtros</h2>
            {totalSelected > 0 ? <p className="mt-1 text-xs text-[#62615d]">{totalSelected} activos</p> : null}
          </div>
          <div className="flex items-center gap-2 text-[#62615d]">
            {isPending ? <span className="text-xs">Aplicando...</span> : null}
            <SlidersHorizontal size={18} />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <FilterGroup title="Categoría" count={selectedCount(selected.category)}>
            {[...parentCategories, ...childCategories].map((category) => (
              <CheckboxFilter
                key={category.slug}
                name="category"
                value={category.slug}
                label={category.name}
                count={category._count.products}
                checked={isSelected(selected.category, category.slug)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Marca" count={selectedCount(selected.brand)}>
            {filters.brands.map((brand) => (
              <CheckboxFilter
                key={brand.slug}
                name="brand"
                value={brand.slug}
                label={brand.name}
                count={brand._count.products}
                checked={isSelected(selected.brand, brand.slug)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Color" count={selectedCount(selected.color)}>
            <div className="grid grid-cols-2 gap-1">
              {filters.colors.map((color) => (
                <CheckboxFilter key={color} name="color" value={color} label={color} checked={isSelected(selected.color, color)} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Talla" count={selectedCount(selected.size)}>
            <div className="grid grid-cols-2 gap-1">
              {filters.sizes.map((size) => (
                <CheckboxFilter key={size} name="size" value={size} label={size} checked={isSelected(selected.size, size)} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Precio" count={priceCount}>
            <div className="grid grid-cols-2 gap-2 px-2 py-1">
              <label className="text-xs font-medium text-[#62615d]">
                Mín.
                <input
                  className="premium-focus mt-1 h-10 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm"
                  name="minPrice"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={selected.minPrice ?? ""}
                />
              </label>
              <label className="text-xs font-medium text-[#62615d]">
                Máx.
                <input
                  className="premium-focus mt-1 h-10 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm"
                  name="maxPrice"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={selected.maxPrice ?? ""}
                />
              </label>
            </div>
          </FilterGroup>

          {filters.attributes.map((attribute) => (
            <FilterGroup key={attribute.slug} title={attribute.name} count={selectedCount(selected.attribute?.filter((slug) => attribute.values.some((value) => value.slug === slug)))}>
              {attribute.values.map((value) => (
                <CheckboxFilter
                  key={value.slug}
                  name="attribute"
                  value={value.slug}
                  label={value.value}
                  checked={isSelected(selected.attribute, value.slug)}
                />
              ))}
            </FilterGroup>
          ))}
        </div>

        <div className="mt-5">
          <Link
            href={actionPath}
            scroll={false}
            className="premium-focus inline-flex h-10 w-full items-center justify-center rounded-[var(--radius-sm)] border border-[#d8d1c5] text-sm font-semibold text-[#151515] transition hover:border-[#151515]"
          >
            Limpiar filtros
          </Link>
        </div>
      </form>
    </aside>
  );
}
