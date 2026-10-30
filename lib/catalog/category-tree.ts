import { catalogGroupKeys, type CatalogGroupKey } from "./catalog-groups";

export type CategoryNode = { id: string; name: string; parentId: string | null; catalogGroup?: string | null };

export function categoryDescendants(categories: CategoryNode[], id: string) {
  const ids = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const category of categories) {
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id);
        changed = true;
      }
    }
  }
  return ids;
}

export function categoryPath(categories: CategoryNode[], id: string): string {
  const names: string[] = [];
  const seen = new Set<string>();
  let category = categories.find((item) => item.id === id);
  while (category && !seen.has(category.id)) {
    seen.add(category.id);
    names.unshift(category.name);
    category = categories.find((item) => item.id === category?.parentId);
  }
  return names.join(" > ");
}

export function categoryCatalogGroup(categories: CategoryNode[], id?: string | null): CatalogGroupKey | null {
  const seen = new Set<string>();
  let category = categories.find((item) => item.id === id);
  while (category && !seen.has(category.id)) {
    seen.add(category.id);
    if (catalogGroupKeys.includes(category.catalogGroup as CatalogGroupKey)) return category.catalogGroup as CatalogGroupKey;
    category = categories.find((item) => item.id === category?.parentId);
  }
  return null;
}
