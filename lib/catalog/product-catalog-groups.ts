import { catalogGroupKeys, catalogGroupTerms, type CatalogGroupKey } from "@/lib/catalog/catalog-groups";

type CatalogGroupSource = {
  name?: string | null;
  description?: string | null;
  category?: { name?: string | null; slug?: string | null } | null;
  brand?: { name?: string | null; slug?: string | null } | null;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function inferProductCatalogGroups(product: CatalogGroupSource): CatalogGroupKey[] {
  const haystack = normalize(
    [
      product.name,
      product.description,
      product.category?.name,
      product.category?.slug,
      product.brand?.name,
      product.brand?.slug,
    ]
      .filter(Boolean)
      .join(" "),
  );

  return catalogGroupKeys.filter((group) =>
    catalogGroupTerms(group).some((term) => haystack.includes(normalize(term))),
  );
}
