import { prisma } from "@/lib/db/prisma";

export const PRODUCTS_PER_PAGE = 12;

export type CatalogSearchParams = {
  q?: string;
  category?: string[];
  brand?: string[];
  color?: string[];
  size?: string[];
  attribute?: string[];
  minPrice?: number;
  maxPrice?: number;
  page: number;
  sort: "relevance" | "price-asc" | "price-desc" | "newest";
};

type SearchParamsInput = Record<string, string | string[] | undefined>;

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
    category: arrayParam(params.category),
    brand: arrayParam(params.brand),
    color: arrayParam(params.color),
    size: arrayParam(params.size),
    attribute: arrayParam(params.attribute),
    minPrice: numberParam(params.minPrice),
    maxPrice: numberParam(params.maxPrice),
    page,
    sort: sort === "price-asc" || sort === "price-desc" || sort === "newest" ? sort : "relevance",
  };
}

function buildProductWhere(filters: CatalogSearchParams) {
  const variantFilters = {
    isActive: true,
    ...(filters.color?.length ? { color: { in: filters.color } } : {}),
    ...(filters.size?.length ? { size: { in: filters.size } } : {}),
    ...(typeof filters.minPrice === "number" || typeof filters.maxPrice === "number"
      ? {
          priceCents: {
            ...(typeof filters.minPrice === "number" ? { gte: Math.round(filters.minPrice * 100) } : {}),
            ...(typeof filters.maxPrice === "number" ? { lte: Math.round(filters.maxPrice * 100) } : {}),
          },
        }
      : {}),
  };

  return {
    isActive: true,
    status: "ACTIVE" as const,
    ...(typeof filters.minPrice === "number" ? { maxPriceCents: { gte: Math.round(filters.minPrice * 100) } } : {}),
    ...(typeof filters.maxPrice === "number" ? { minPriceCents: { lte: Math.round(filters.maxPrice * 100) } } : {}),
    ...(filters.category?.length ? { category: { slug: { in: filters.category } } } : {}),
    ...(filters.brand?.length ? { brand: { slug: { in: filters.brand } } } : {}),
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

function productOrderBy(sort: CatalogSearchParams["sort"]) {
  if (sort === "newest") return [{ createdAt: "desc" as const }];
  if (sort === "price-asc") return [{ minPriceCents: "asc" as const }, { name: "asc" as const }];
  if (sort === "price-desc") return [{ minPriceCents: "desc" as const }, { name: "asc" as const }];
  return [{ isFeatured: "desc" as const }, { createdAt: "desc" as const }];
}

export async function getCatalogProducts(filters: CatalogSearchParams) {
  const where = buildProductWhere(filters);
  const skip = (filters.page - 1) * PRODUCTS_PER_PAGE;

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
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
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        images: {
          orderBy: { position: "asc" },
          take: 1,
          select: { url: true, alt: true },
        },
        variants: {
          where: {
            isActive: true,
            ...(filters.color?.length ? { color: { in: filters.color } } : {}),
            ...(filters.size?.length ? { size: { in: filters.size } } : {}),
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
    }),
  ]);

  return {
    products,
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
    perPage: PRODUCTS_PER_PAGE,
  };
}

export async function getCatalogFilters() {
  const [categories, brands, colors, sizes, attributes] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        _count: { select: { products: { where: { isActive: true, status: "ACTIVE" } } } },
      },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
        _count: { select: { products: { where: { isActive: true, status: "ACTIVE" } } } },
      },
    }),
    prisma.productVariant.findMany({
      where: { isActive: true, product: { isActive: true, status: "ACTIVE" }, color: { not: null } },
      distinct: ["color"],
      orderBy: { color: "asc" },
      select: { color: true },
    }),
    prisma.productVariant.findMany({
      where: { isActive: true, product: { isActive: true, status: "ACTIVE" }, size: { not: null } },
      distinct: ["size"],
      orderBy: { size: "asc" },
      select: { size: true },
    }),
    prisma.attribute.findMany({
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
        values: {
          orderBy: { value: "asc" },
          select: { value: true, slug: true },
        },
      },
    }),
  ]);

  return {
    categories,
    brands,
    colors: colors.flatMap((item) => (item.color ? [item.color] : [])),
    sizes: sizes.flatMap((item) => (item.size ? [item.size] : [])),
    attributes,
  };
}

export async function getFeaturedProducts(take = 3) {
  return prisma.product.findMany({
    where: { isActive: true, status: "ACTIVE", isFeatured: true },
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
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } },
      variants: {
        where: { isActive: true },
        orderBy: { priceCents: "asc" },
        take: 3,
        select: { sku: true, color: true, size: true, priceCents: true, currency: true, stock: true },
      },
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true, status: "ACTIVE" },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { position: "asc" } },
      variants: { where: { isActive: true }, orderBy: [{ priceCents: "asc" }, { size: "asc" }] },
      attributeValues: {
        include: {
          attributeValue: {
            include: { attribute: true },
          },
        },
      },
    },
  });
}

export async function getRelatedProducts(product: { id: string; categoryId: string | null; brandId: string | null }, take = 3) {
  const relatedConditions = [
    ...(product.categoryId ? [{ categoryId: product.categoryId }] : []),
    ...(product.brandId ? [{ brandId: product.brandId }] : []),
  ];

  if (!relatedConditions.length) {
    return [];
  }

  return prisma.product.findMany({
    where: {
      id: { not: product.id },
      isActive: true,
      status: "ACTIVE",
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
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } },
      variants: {
        where: { isActive: true },
        orderBy: { priceCents: "asc" },
        take: 3,
        select: { sku: true, color: true, size: true, priceCents: true, currency: true, stock: true },
      },
    },
  });
}
