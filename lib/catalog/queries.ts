import { prisma } from "@/lib/db/prisma";
import { defaultLocale, type Locale } from "@/config/i18n";
import { catalogGroupKeys, catalogGroupTerms } from "@/lib/catalog/catalog-groups";
import { colorGroupKeys, sizeGroupKeys } from "@/lib/catalog/filter-groups";

export const PRODUCTS_PER_PAGE = 12;
const pendingImagePath = "/images/products/product-image-pending.svg";
const visibleProductImageWhere = {
  images: {
    some: {
      url: { not: pendingImagePath },
    },
  },
} as const;

export type CatalogSearchParams = {
  q?: string;
  catalog?: string[];
  category?: string[];
  brand?: string[];
  color?: string[];
  size?: string[];
  gender?: string[];
  material?: string[];
  attribute?: string[];
  minPrice?: number;
  maxPrice?: number;
  page: number;
  sort: "relevance" | "price-asc" | "price-desc" | "newest";
};

type SearchParamsInput = Record<string, string | string[] | undefined>;
type CatalogFacetKey = "catalog" | "category" | "brand" | "color" | "size" | "gender" | "material" | "attribute" | "price";

function arrayParam(value: string | string[] | undefined) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return values.map((item) => item.trim()).filter(Boolean);
}

function numberParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseCatalogSearchParams(params: SearchParamsInput): CatalogSearchParams {
  const page = Math.max(1, Math.floor(numberParam(params.page) ?? 1));
  const sort = Array.isArray(params.sort) ? params.sort[0] : params.sort;

  return {
    q: (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() || undefined,
    catalog: arrayParam(params.catalog),
    category: arrayParam(params.category),
    brand: arrayParam(params.brand),
    color: arrayParam(params.color),
    size: arrayParam(params.size),
    gender: arrayParam(params.gender),
    material: arrayParam(params.material),
    attribute: arrayParam(params.attribute),
    minPrice: numberParam(params.minPrice),
    maxPrice: numberParam(params.maxPrice),
    page,
    sort: sort === "price-asc" || sort === "price-desc" || sort === "newest" ? sort : "relevance",
  };
}

function localizedText<T extends { translations?: { name?: string; description?: string | null; value?: string }[] }>(item: T, field: "name" | "description" | "value") {
  return item.translations?.[0]?.[field] ?? item[field as keyof T];
}

function localizeCategory<T extends { name: string; description?: string | null; translations?: { name: string; description?: string | null }[] } | null>(category: T) {
  if (!category) return category;
  return {
    ...category,
    name: localizedText(category, "name") as string,
    description: localizedText(category, "description") as string | null | undefined,
  };
}

function localizeBrand<T extends { name: string; translations?: { name: string }[] } | null>(brand: T) {
  if (!brand) return brand;
  return {
    ...brand,
    name: localizedText(brand, "name") as string,
  };
}

function localizeProduct<T extends { name: string; description: string | null; translations?: { name: string; description?: string | null; metaTitle?: string | null; metaDescription?: string | null }[]; category?: any; brand?: any }>(product: T) {
  const translation = product.translations?.[0];

  return {
    ...product,
    name: translation?.name ?? product.name,
    description: translation?.description ?? product.description,
    metaTitle: translation?.metaTitle ?? ("metaTitle" in product ? product.metaTitle : undefined),
    metaDescription: translation?.metaDescription ?? ("metaDescription" in product ? product.metaDescription : undefined),
    category: localizeCategory(product.category),
    brand: localizeBrand(product.brand),
  };
}

function buildProductWhere(filters: CatalogSearchParams, locale: Locale = defaultLocale) {
  const variantFilters = {
    isActive: true,
    ...(filters.color?.length ? { colorGroup: { in: filters.color } } : {}),
    ...(filters.size?.length ? { sizeGroup: { in: filters.size } } : {}),
    ...(typeof filters.minPrice === "number" || typeof filters.maxPrice === "number"
      ? {
          priceCents: {
            ...(typeof filters.minPrice === "number" ? { gte: Math.round(filters.minPrice * 100) } : {}),
            ...(typeof filters.maxPrice === "number" ? { lte: Math.round(filters.maxPrice * 100) } : {}),
          },
        }
      : {}),
  };

  const selectedCatalogTerms = filters.catalog?.flatMap((group) => catalogGroupTerms(group)) ?? [];
  const catalogGroupFilter = selectedCatalogTerms.length
    ? {
        OR: selectedCatalogTerms.map((term) => ({
          OR: [
            { name: { contains: term, mode: "insensitive" as const } },
            { description: { contains: term, mode: "insensitive" as const } },
            { category: { name: { contains: term, mode: "insensitive" as const } } },
            { category: { slug: { contains: term.toLowerCase().replaceAll(" ", "-"), mode: "insensitive" as const } } },
            { brand: { name: { contains: term, mode: "insensitive" as const } } },
          ],
        })),
      }
    : {};

  return {
    isActive: true,
    status: "ACTIVE" as const,
    ...visibleProductImageWhere,
    ...catalogGroupFilter,
    ...(typeof filters.minPrice === "number" ? { maxPriceCents: { gte: Math.round(filters.minPrice * 100) } } : {}),
    ...(typeof filters.maxPrice === "number" ? { minPriceCents: { lte: Math.round(filters.maxPrice * 100) } } : {}),
    ...(filters.category?.length ? { category: { slug: { in: filters.category } } } : {}),
    ...(filters.brand?.length ? { brand: { slug: { in: filters.brand } } } : {}),
    ...(filters.gender?.length ? { gender: { in: filters.gender } } : {}),
    ...(filters.material?.length ? { material: { in: filters.material } } : {}),
    ...(filters.attribute?.length
      ? {
          attributeValues: {
            some: {
              attributeValue: {
                slug: { in: filters.attribute },
              },
            },
          },
        }
      : {}),
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" as const } },
            { sku: { contains: filters.q, mode: "insensitive" as const } },
            { description: { contains: filters.q, mode: "insensitive" as const } },
            ...(locale === defaultLocale
              ? []
              : [
                  {
                    translations: {
                      some: {
                        locale,
                        OR: [
                          { name: { contains: filters.q, mode: "insensitive" as const } },
                          { description: { contains: filters.q, mode: "insensitive" as const } },
                        ],
                      },
                    },
                  },
                ]),
            {
              variants: {
                some: {
                  sku: { contains: filters.q, mode: "insensitive" as const },
                },
              },
            },
          ],
        }
      : {}),
    ...(Object.keys(variantFilters).length > 1 ? { variants: { some: variantFilters } } : {}),
  };
}

function buildFacetWhere(filters: CatalogSearchParams, omittedFilter: CatalogFacetKey, locale: Locale = defaultLocale) {
  return buildProductWhere(
    {
      ...filters,
      catalog: omittedFilter === "catalog" ? [] : filters.catalog,
      category: omittedFilter === "category" ? [] : filters.category,
      brand: omittedFilter === "brand" ? [] : filters.brand,
      color: omittedFilter === "color" ? [] : filters.color,
      size: omittedFilter === "size" ? [] : filters.size,
      gender: omittedFilter === "gender" ? [] : filters.gender,
      material: omittedFilter === "material" ? [] : filters.material,
      attribute: omittedFilter === "attribute" ? [] : filters.attribute,
      minPrice: omittedFilter === "price" ? undefined : filters.minPrice,
      maxPrice: omittedFilter === "price" ? undefined : filters.maxPrice,
      page: 1,
      sort: "relevance",
    },
    locale,
  );
}

function productOrderBy(sort: CatalogSearchParams["sort"]) {
  if (sort === "newest") return [{ createdAt: "desc" as const }];
  if (sort === "price-asc") return [{ minPriceCents: "asc" as const }, { name: "asc" as const }];
  if (sort === "price-desc") return [{ minPriceCents: "desc" as const }, { name: "asc" as const }];
  return [{ isFeatured: "desc" as const }, { createdAt: "desc" as const }];
}

export async function getCatalogProducts(filters: CatalogSearchParams, locale: Locale = defaultLocale) {
  const where = buildProductWhere(filters, locale);
  const skip = (filters.page - 1) * PRODUCTS_PER_PAGE;

  const total = await prisma.product.count({ where });
  const products = await prisma.product.findMany({
    where,
    orderBy: productOrderBy(filters.sort),
    skip,
    take: PRODUCTS_PER_PAGE,
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      description: true,
      isFeatured: true,
      minPriceCents: true,
      maxPriceCents: true,
      translations: { where: { locale }, take: 1, select: { name: true, description: true, metaTitle: true, metaDescription: true } },
      category: { select: { id: true, name: true, slug: true, translations: { where: { locale }, take: 1, select: { name: true, description: true } } } },
      brand: { select: { id: true, name: true, slug: true, translations: { where: { locale }, take: 1, select: { name: true } } } },
      images: {
        orderBy: { position: "asc" },
        take: 1,
        select: { url: true, alt: true },
      },
      variants: {
        where: {
          isActive: true,
          ...(filters.color?.length ? { colorGroup: { in: filters.color } } : {}),
          ...(filters.size?.length ? { sizeGroup: { in: filters.size } } : {}),
        },
        orderBy: { priceCents: filters.sort === "price-desc" ? "desc" : "asc" },
        take: 6,
        select: {
          sku: true,
          color: true,
          size: true,
          priceCents: true,
          currency: true,
          stock: true,
        },
      },
    },
  });

  return {
    products: products.map(localizeProduct),
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
    perPage: PRODUCTS_PER_PAGE,
  };
}

export async function getCatalogFilters() {
  return getCatalogFiltersForSearch({
    page: 1,
    sort: "relevance",
  });
}

export async function getCatalogFiltersForSearch(filters: CatalogSearchParams, locale: Locale = defaultLocale) {
  const categoryFacetWhere = buildFacetWhere(filters, "category", locale);
  const brandFacetWhere = buildFacetWhere(filters, "brand", locale);
  const colorFacetWhere = buildFacetWhere(filters, "color", locale);
  const sizeFacetWhere = buildFacetWhere(filters, "size", locale);
  const genderFacetWhere = buildFacetWhere(filters, "gender", locale);
  const materialFacetWhere = buildFacetWhere(filters, "material", locale);
  const attributeFacetWhere = buildFacetWhere(filters, "attribute", locale);

  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      translations: { where: { locale }, take: 1, select: { name: true, description: true } },
      _count: { select: { products: { where: categoryFacetWhere } } },
    },
  });
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: {
      name: true,
      slug: true,
      translations: { where: { locale }, take: 1, select: { name: true } },
      _count: { select: { products: { where: brandFacetWhere } } },
    },
  });
  const colors = await prisma.productVariant.findMany({
    where: { isActive: true, product: colorFacetWhere, colorGroup: { not: null } },
    distinct: ["colorGroup"],
    orderBy: { colorGroup: "asc" },
    select: { colorGroup: true },
  });
  const sizes = await prisma.productVariant.findMany({
    where: { isActive: true, product: sizeFacetWhere, sizeGroup: { not: null } },
    distinct: ["sizeGroup"],
    orderBy: { sizeGroup: "asc" },
    select: { sizeGroup: true },
  });
  const genders = await prisma.product.findMany({
    where: { ...genderFacetWhere, gender: { not: null } },
    distinct: ["gender"],
    orderBy: { gender: "asc" },
    select: { gender: true },
  });
  const materials = await prisma.product.findMany({
    where: { ...materialFacetWhere, material: { not: null } },
    distinct: ["material"],
    orderBy: { material: "asc" },
    select: { material: true },
  });
  const attributes = await prisma.attribute.findMany({
    orderBy: { name: "asc" },
    select: {
      name: true,
      slug: true,
      values: {
        where: {
          products: {
            some: {
              product: attributeFacetWhere,
            },
          },
        },
        orderBy: { value: "asc" },
        select: { value: true, slug: true },
      },
    },
  });
  const catalogGroups = await Promise.all(
    catalogGroupKeys.map(async (key) => ({
      slug: key,
      count: await prisma.product.count({
        where: buildProductWhere(
          {
            ...filters,
            catalog: [key],
            page: 1,
            sort: "relevance",
          },
          locale,
        ),
      }),
    })),
  );

  return {
    catalogGroups: catalogGroups.filter((group) => group.count > 0),
    categories: categories.filter((category) => category._count.products > 0).map(localizeCategory),
    brands: brands.filter((brand) => brand._count.products > 0).map(localizeBrand),
    colors: colorGroupKeys.filter((key) => colors.some((item) => item.colorGroup === key)),
    sizes: sizeGroupKeys.filter((key) => sizes.some((item) => item.sizeGroup === key)),
    genders: genders.flatMap((item) => (item.gender ? [item.gender] : [])),
    materials: materials.flatMap((item) => (item.material ? [item.material] : [])),
    attributes: attributes.filter((attribute) => attribute.values.length > 0),
  };
}

export async function getFeaturedProducts(take = 3, locale: Locale = defaultLocale) {
  const products = await prisma.product.findMany({
    where: { isActive: true, status: "ACTIVE", isFeatured: true, ...visibleProductImageWhere },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      description: true,
      isFeatured: true,
      minPriceCents: true,
      maxPriceCents: true,
      translations: { where: { locale }, take: 1, select: { name: true, description: true, metaTitle: true, metaDescription: true } },
      category: { select: { id: true, name: true, slug: true, translations: { where: { locale }, take: 1, select: { name: true, description: true } } } },
      brand: { select: { id: true, name: true, slug: true, translations: { where: { locale }, take: 1, select: { name: true } } } },
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } },
      variants: {
        where: { isActive: true },
        orderBy: { priceCents: "asc" },
        take: 3,
        select: { sku: true, color: true, size: true, priceCents: true, currency: true, stock: true },
      },
    },
  });

  return products.map(localizeProduct);
}

export async function getProductBySlug(slug: string, locale: Locale = defaultLocale) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true, status: "ACTIVE", ...visibleProductImageWhere },
    include: {
      translations: { where: { locale }, take: 1 },
      category: { include: { translations: { where: { locale }, take: 1 } } },
      brand: { include: { translations: { where: { locale }, take: 1 } } },
      images: { orderBy: { position: "asc" } },
      documents: { orderBy: { position: "asc" } },
      variants: { where: { isActive: true }, orderBy: [{ priceCents: "asc" }, { size: "asc" }] },
      attributeValues: {
        include: {
          attributeValue: {
            include: {
              translations: { where: { locale }, take: 1 },
              attribute: { include: { translations: { where: { locale }, take: 1 } } },
            },
          },
        },
      },
    },
  });

  if (!product) return null;

  return {
    ...localizeProduct(product),
    attributeValues: product.attributeValues.map((item) => ({
      ...item,
      attributeValue: {
        ...item.attributeValue,
        value: localizedText(item.attributeValue, "value") as string,
        attribute: {
          ...item.attributeValue.attribute,
          name: localizedText(item.attributeValue.attribute, "name") as string,
        },
      },
    })),
  };
}

export async function getRelatedProducts(product: { id: string; categoryId: string | null; brandId: string | null }, take = 3, locale: Locale = defaultLocale) {
  const relatedConditions = [
    ...(product.categoryId ? [{ categoryId: product.categoryId }] : []),
    ...(product.brandId ? [{ brandId: product.brandId }] : []),
  ];

  if (!relatedConditions.length) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      isActive: true,
      status: "ACTIVE",
      ...visibleProductImageWhere,
      OR: relatedConditions,
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take,
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      description: true,
      isFeatured: true,
      minPriceCents: true,
      maxPriceCents: true,
      translations: { where: { locale }, take: 1, select: { name: true, description: true, metaTitle: true, metaDescription: true } },
      category: { select: { id: true, name: true, slug: true, translations: { where: { locale }, take: 1, select: { name: true, description: true } } } },
      brand: { select: { id: true, name: true, slug: true, translations: { where: { locale }, take: 1, select: { name: true } } } },
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } },
      variants: {
        where: { isActive: true },
        orderBy: { priceCents: "asc" },
        take: 3,
        select: { sku: true, color: true, size: true, priceCents: true, currency: true, stock: true },
      },
    },
  });

  return products.map(localizeProduct);
}
