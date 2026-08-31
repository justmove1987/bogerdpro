"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { CatalogSearchParams } from "@/lib/catalog/queries";
import type { Dictionary } from "@/lib/i18n/dictionary";

type CatalogFiltersData = {
  catalogGroups: {
    slug: string;
    count: number;
  }[];
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
  genders: string[];
  materials: {
    slug: string;
    count: number;
  }[];
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
  swatchClassName,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  count?: number;
  swatchClassName?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-2 py-2 text-sm text-[#62615d] transition hover:bg-[#f7f5f0] hover:text-[#151515]">
      <input className="h-4 w-4 accent-[var(--accent)]" name={name} value={value} defaultChecked={checked} type="checkbox" />
      {swatchClassName ? <span className={`h-4 w-4 shrink-0 rounded-full border border-[#d8d1c5] ${swatchClassName}`} /> : null}
      <span className="flex-1">{label}</span>
      {typeof count === "number" ? <span className="text-xs text-[#8b8880]">{count}</span> : null}
    </label>
  );
}

const colorSwatches: Record<string, string> = {
  black: "bg-[#171717]",
  white: "bg-white",
  grey: "bg-[#8a8a8a]",
  navy: "bg-[#172554]",
  blue: "bg-[#2563eb]",
  red: "bg-[#dc2626]",
  green: "bg-[#16a34a]",
  yellow: "bg-[#facc15]",
  orange: "bg-[#f97316]",
  pink: "bg-[#ec4899]",
  purple: "bg-[#7e22ce]",
  beige: "bg-[#c8b692]",
  brown: "bg-[#7c4a2d]",
  multicolor: "bg-[linear-gradient(135deg,#111_0_25%,#2563eb_25%_50%,#facc15_50%_75%,#dc2626_75%)]",
};

function groupLabel(labels: Record<string, string>, key: string) {
  return labels[key] ?? key;
}

export function CatalogFilters({
  filters,
  selected,
  actionPath = "/catalog",
  labels,
}: {
  filters: CatalogFiltersData;
  selected: CatalogSearchParams;
  actionPath?: string;
  labels: Dictionary["catalog"];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const priceCount = Number(typeof selected.minPrice === "number") + Number(typeof selected.maxPrice === "number");
  const totalSelected =
    selectedCount(selected.catalog) +
    selectedCount(selected.category) +
    selectedCount(selected.brand) +
    selectedCount(selected.color) +
    selectedCount(selected.size) +
    selectedCount(selected.gender) +
    selectedCount(selected.material) +
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
            <h2 className="text-base font-semibold">{labels.filters}</h2>
            {totalSelected > 0 ? <p className="mt-1 text-xs text-[#62615d]">{totalSelected} {labels.active}</p> : null}
          </div>
          <div className="flex items-center gap-2 text-[#62615d]">
            {isPending ? <span className="text-xs">{labels.applying}</span> : null}
            <SlidersHorizontal size={18} />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <FilterGroup title={labels.catalogDivision} count={selectedCount(selected.catalog)}>
            {filters.catalogGroups.map((group) => (
              <CheckboxFilter
                key={group.slug}
                name="catalog"
                value={group.slug}
                label={groupLabel(labels.catalogGroups, group.slug)}
                count={group.count}
                checked={isSelected(selected.catalog, group.slug)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title={labels.brand} count={selectedCount(selected.brand)}>
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

          <FilterGroup title={labels.color} count={selectedCount(selected.color)}>
            <div className="grid grid-cols-2 gap-1">
              {filters.colors.map((color) => (
                <CheckboxFilter key={color} name="color" value={color} label={groupLabel(labels.colorGroups, color)} checked={isSelected(selected.color, color)} swatchClassName={colorSwatches[color]} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title={labels.size} count={selectedCount(selected.size)}>
            <div className="grid grid-cols-2 gap-1">
              {filters.sizes.map((size) => (
                <CheckboxFilter key={size} name="size" value={size} label={groupLabel(labels.sizeGroups, size)} checked={isSelected(selected.size, size)} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title={labels.gender} count={selectedCount(selected.gender)}>
            <div className="grid grid-cols-1 gap-1">
              {filters.genders.map((gender) => (
                <CheckboxFilter key={gender} name="gender" value={gender} label={gender} checked={isSelected(selected.gender, gender)} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title={labels.material} count={selectedCount(selected.material)}>
            <div className="grid grid-cols-1 gap-1">
              {filters.materials.map((material) => (
                <CheckboxFilter
                  key={material.slug}
                  name="material"
                  value={material.slug}
                  label={groupLabel(labels.materialGroups, material.slug)}
                  count={material.count}
                  checked={isSelected(selected.material, material.slug)}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title={labels.price} count={priceCount}>
            <div className="grid grid-cols-2 gap-2 px-2 py-1">
              <label className="text-xs font-medium text-[#62615d]">
                {labels.min}
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
                {labels.max}
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
            {labels.clearFilters}
          </Link>
        </div>
      </form>
    </aside>
  );
}
