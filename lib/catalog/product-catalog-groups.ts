import { catalogGroupKeys, catalogGroupTerms, type CatalogGroupKey } from "@/lib/catalog/catalog-groups";

type CatalogGroupSource = {
  name?: string | null;
  description?: string | null;
  specifications?: unknown;
  category?: { name?: string | null; slug?: string | null } | null;
  brand?: { name?: string | null; slug?: string | null } | null;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Complete words, including regular plurals: "batas" matches, "corbata" does not.
function mentions(text: string, terms: string[]) {
  return terms.some((term) => new RegExp(`(?:^| )${normalize(term)}(?:s|es)?(?: |$)`).test(text));
}

function supplierFamily(specifications: unknown) {
  if (!Array.isArray(specifications)) return "";
  return specifications.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { label, value } = item as { label?: unknown; value?: unknown };
    return typeof label === "string" && typeof value === "string" &&
      ["familia", "family", "categorias", "categories", "sector", "sector de uso", "profesion", "profession", "coleccion", "collection", "articulo"].includes(normalize(label)) ? [value] : [];
  }).join(" ");
}

function isHealthcare(family: string, description: string) {
  // A supplier's family/use designation is stronger evidence than marketing copy.
  if (mentions(family, ["sanidad", "sanitario", "sanitaria", "salud", "clinica", "clinico", "enfermeria", "healthcare", "health wellness", "medical", "bata", "casaca", "pijama", "scrub", "estetica", "peluqueria", "dentista", "doctor", "doctora", "farmacia", "veterinario", "veterinaria", "limpieza"])) return true;
  // "Estética del diseño", cleaning instructions, and generic hygiene claims are not sectors.
  return mentions(description, ["bata", "casaca", "pijama", "scrub", "sanidad", "sanitario", "sanitaria", "enfermeria", "enfermero", "enfermera", "hospital", "hospitalario", "hospitalaria", "clinica", "clinico", "clinicos", "healthcare", "medical", "centro de salud", "centros de salud", "profesionales de la salud", "personal de limpieza", "servicios de limpieza", "sector de limpieza", "centro de estetica", "centros de estetica", "profesionales de estetica", "salon de belleza", "salones de belleza", "peluqueria"]);
}

export function inferProductCatalogGroups(product: CatalogGroupSource): CatalogGroupKey[] {
  const family = normalize([product.name, product.category?.name, product.category?.slug, supplierFamily(product.specifications)].filter(Boolean).join(" "));
  const description = normalize(product.description ?? "");
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

  return catalogGroupKeys.filter((group) => group === "healthcare"
    ? isHealthcare(family, description)
    : mentions(haystack, catalogGroupTerms(group)));
}
