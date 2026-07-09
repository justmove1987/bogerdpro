import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Alta visibilidad", slug: "alta-visibilidad" },
  { name: "Calzado de trabajo", slug: "calzado-de-trabajo" },
  { name: "Equipos de protección", slug: "equipos-de-proteccion" },
  { name: "Industria, construcción y logística", slug: "industria-construccion-y-logistica" },
  { name: "Hostelería y restauración", slug: "hosteleria-y-restauracion" },
  { name: "Sanidad y servicios", slug: "sanidad-y-servicios" },
  { name: "Sport, casual & promo y eventos", slug: "sport-casual-promo-y-eventos" },
];

const subcategories = [
  { name: "Chaquetas y parkas", slug: "chaquetas-parkas", parentSlug: "alta-visibilidad" },
  { name: "Pantalones técnicos", slug: "pantalones-tecnicos", parentSlug: "industria-construccion-y-logistica" },
  { name: "Guantes de protección", slug: "guantes-proteccion", parentSlug: "equipos-de-proteccion" },
  { name: "Zapatos S3", slug: "zapatos-s3", parentSlug: "calzado-de-trabajo" },
];

const brands = [
  { name: "Projob", slug: "projob" },
  { name: "Roly Work", slug: "roly-work" },
  { name: "Velilla", slug: "velilla" },
  { name: "Workteam", slug: "workteam" },
  { name: "Deltaplus", slug: "deltaplus" },
  { name: "Gary's", slug: "garys" },
  { name: "BogerdPro", slug: "bogerdpro" },
];

const attributes = [
  { name: "Normativa", slug: "normativa", values: ["EN ISO 20471", "S3 SRC", "EN 388", "Antideslizante"] },
  { name: "Uso recomendado", slug: "uso-recomendado", values: ["Construcción", "Logística", "Industria", "Hostelería", "Sanidad"] },
  { name: "Material", slug: "material", values: ["Softshell", "Algodón técnico", "Piel", "Microfibra", "Nitrilo"] },
];

type SeedProduct = {
  sku: string;
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  brandSlug: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
  attributes: string[];
  variants: {
    sku: string;
    name: string;
    color?: string;
    size?: string;
    priceCents: number;
    stock: number;
  }[];
};

const products: SeedProduct[] = [
  {
    sku: "BP-AV-CHAQ",
    name: "Chaqueta técnica de alta visibilidad",
    slug: "chaqueta-tecnica-alta-visibilidad",
    description:
      "Chaqueta profesional de alta visibilidad para obra, logística y trabajos exteriores. Combina protección, comodidad y una imagen cuidada para equipos profesionales.",
    categorySlug: "chaquetas-parkas",
    brandSlug: "projob",
    image: "/images/hero/alta-visibilidad-construccion.jpg",
    imageAlt: "Chaqueta técnica de alta visibilidad en obra",
    featured: true,
    attributes: ["EN ISO 20471", "Construcción", "Softshell"],
    variants: [
      { sku: "BP-AV-CHAQ-AM-M", name: "Amarillo / M", color: "Amarillo", size: "M", priceCents: 12900, stock: 18 },
      { sku: "BP-AV-CHAQ-AM-L", name: "Amarillo / L", color: "Amarillo", size: "L", priceCents: 12900, stock: 24 },
      { sku: "BP-AV-CHAQ-NA-L", name: "Naranja / L", color: "Naranja", size: "L", priceCents: 13200, stock: 9 },
    ],
  },
  {
    sku: "BP-CAL-S3",
    name: "Calzado de seguridad premium S3",
    slug: "calzado-seguridad-premium-s3",
    description:
      "Calzado de seguridad cómodo, resistente y certificado para jornadas intensivas en construcción, mantenimiento, almacén e industria.",
    categorySlug: "zapatos-s3",
    brandSlug: "deltaplus",
    image: "/images/sectors/calzado-seguridad-terreno.jpg",
    imageAlt: "Calzado de seguridad en terreno de trabajo",
    featured: true,
    attributes: ["S3 SRC", "Antideslizante", "Piel"],
    variants: [
      { sku: "BP-CAL-S3-40", name: "Negro / 40", color: "Negro", size: "40", priceCents: 8900, stock: 10 },
      { sku: "BP-CAL-S3-42", name: "Negro / 42", color: "Negro", size: "42", priceCents: 8900, stock: 16 },
      { sku: "BP-CAL-S3-44", name: "Negro / 44", color: "Negro", size: "44", priceCents: 8900, stock: 7 },
    ],
  },
  {
    sku: "BP-IND-PANT",
    name: "Pantalón industrial reforzado",
    slug: "pantalon-industrial-reforzado",
    description:
      "Pantalón técnico con refuerzos, bolsillos funcionales y patronaje cómodo para industria, logística y montaje.",
    categorySlug: "pantalones-tecnicos",
    brandSlug: "workteam",
    image: "/images/products/rodillera-pantalon-tecnico.jpg",
    imageAlt: "Pantalón industrial reforzado con rodillera técnica",
    featured: true,
    attributes: ["Industria", "Algodón técnico"],
    variants: [
      { sku: "BP-IND-PANT-GR-M", name: "Gris / M", color: "Gris", size: "M", priceCents: 5450, stock: 30 },
      { sku: "BP-IND-PANT-GR-L", name: "Gris / L", color: "Gris", size: "L", priceCents: 5450, stock: 22 },
      { sku: "BP-IND-PANT-NG-L", name: "Negro / L", color: "Negro", size: "L", priceCents: 5650, stock: 12 },
    ],
  },
  {
    sku: "BP-EPI-GUA",
    name: "Guante técnico anticorte",
    slug: "guante-tecnico-anticorte",
    description:
      "Guante de protección para manipulación, montaje y trabajos con riesgo mecánico. Buena sensibilidad y agarre para uso continuado.",
    categorySlug: "guantes-proteccion",
    brandSlug: "deltaplus",
    image: "/images/sectors/guantes-corte-manipulacion.jpg",
    imageAlt: "Guantes técnicos de protección para manipulación",
    attributes: ["EN 388", "Industria", "Nitrilo"],
    variants: [
      { sku: "BP-EPI-GUA-8", name: "Verde / 8", color: "Verde", size: "8", priceCents: 890, stock: 120 },
      { sku: "BP-EPI-GUA-9", name: "Verde / 9", color: "Verde", size: "9", priceCents: 890, stock: 140 },
      { sku: "BP-EPI-GUA-10", name: "Verde / 10", color: "Verde", size: "10", priceCents: 890, stock: 95 },
    ],
  },
  {
    sku: "BP-HOR-CAM",
    name: "Camisa profesional para hostelería",
    slug: "camisa-profesional-hosteleria",
    description:
      "Camisa laboral elegante y cómoda para sala, hoteles y restauración. Fácil mantenimiento y presencia profesional.",
    categorySlug: "hosteleria-y-restauracion",
    brandSlug: "garys",
    image: "/images/catalogs/category-hosteleria.png",
    imageAlt: "Equipo de hostelería con uniformes profesionales",
    attributes: ["Hostelería", "Microfibra"],
    variants: [
      { sku: "BP-HOR-CAM-BL-S", name: "Blanco / S", color: "Blanco", size: "S", priceCents: 3150, stock: 18 },
      { sku: "BP-HOR-CAM-BL-M", name: "Blanco / M", color: "Blanco", size: "M", priceCents: 3150, stock: 20 },
      { sku: "BP-HOR-CAM-NE-M", name: "Negro / M", color: "Negro", size: "M", priceCents: 3250, stock: 14 },
    ],
  },
  {
    sku: "BP-SAN-CAS",
    name: "Casaca sanitaria unisex",
    slug: "casaca-sanitaria-unisex",
    description:
      "Casaca sanitaria cómoda y resistente para clínicas, consultas, estética y servicios asistenciales.",
    categorySlug: "sanidad-y-servicios",
    brandSlug: "velilla",
    image: "/images/catalogs/SANITAT-I-SERVEIS_VELILLA.BOTO_.png",
    imageAlt: "Vestuario sanitario profesional Velilla",
    attributes: ["Sanidad", "Microfibra"],
    variants: [
      { sku: "BP-SAN-CAS-AZ-S", name: "Azul / S", color: "Azul", size: "S", priceCents: 2790, stock: 21 },
      { sku: "BP-SAN-CAS-AZ-M", name: "Azul / M", color: "Azul", size: "M", priceCents: 2790, stock: 24 },
      { sku: "BP-SAN-CAS-BL-M", name: "Blanco / M", color: "Blanco", size: "M", priceCents: 2790, stock: 19 },
    ],
  },
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@bogerdpro.local";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", name: "BogerdPro Admin" },
    create: {
      email,
      name: "BogerdPro Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.adminUser.upsert({
    where: { email },
    update: { userId: user.id, name: user.name, active: true, role: "OWNER" },
    create: { email, userId: user.id, name: user.name, role: "OWNER" },
  });
}

async function seedCategories() {
  const parents = new Map<string, string>();

  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
    parents.set(category.slug, saved.id);
  }

  for (const category of subcategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, parentId: parents.get(category.parentSlug) },
      create: {
        name: category.name,
        slug: category.slug,
        parentId: parents.get(category.parentSlug),
      },
    });
  }
}

async function seedBrands() {
  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name },
      create: brand,
    });
  }
}

async function seedAttributes() {
  for (const attribute of attributes) {
    const savedAttribute = await prisma.attribute.upsert({
      where: { slug: attribute.slug },
      update: { name: attribute.name },
      create: { name: attribute.name, slug: attribute.slug },
    });

    for (const value of attribute.values) {
      const slug = slugify(value);
      await prisma.attributeValue.upsert({
        where: {
          attributeId_slug: {
            attributeId: savedAttribute.id,
            slug,
          },
        },
        update: { value },
        create: {
          attributeId: savedAttribute.id,
          value,
          slug,
        },
      });
    }
  }
}

async function seedProducts() {
  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: product.categorySlug } });
    const brand = await prisma.brand.findUniqueOrThrow({ where: { slug: product.brandSlug } });
    const attributeValues = await prisma.attributeValue.findMany({
      where: {
        slug: { in: product.attributes.map(slugify) },
      },
      select: { id: true },
    });
    const prices = product.variants.map((variant) => variant.priceCents);

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        sku: product.sku,
        name: product.name,
        description: product.description,
        status: "ACTIVE",
        isActive: true,
        isFeatured: product.featured ?? false,
        minPriceCents: Math.min(...prices),
        maxPriceCents: Math.max(...prices),
        categoryId: category.id,
        brandId: brand.id,
        images: {
          deleteMany: {},
          create: [{ url: product.image, alt: product.imageAlt, position: 0 }],
        },
        variants: {
          deleteMany: {},
          create: product.variants.map((variant) => ({
            sku: variant.sku,
            name: variant.name,
            color: variant.color,
            size: variant.size,
            priceCents: variant.priceCents,
            stock: variant.stock,
            isActive: true,
          })),
        },
        attributeValues: {
          deleteMany: {},
          create: attributeValues.map((value) => ({ attributeValueId: value.id })),
        },
      },
      create: {
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        description: product.description,
        status: "ACTIVE",
        isActive: true,
        isFeatured: product.featured ?? false,
        minPriceCents: Math.min(...prices),
        maxPriceCents: Math.max(...prices),
        categoryId: category.id,
        brandId: brand.id,
        images: {
          create: [{ url: product.image, alt: product.imageAlt, position: 0 }],
        },
        variants: {
          create: product.variants.map((variant) => ({
            sku: variant.sku,
            name: variant.name,
            color: variant.color,
            size: variant.size,
            priceCents: variant.priceCents,
            stock: variant.stock,
            isActive: true,
          })),
        },
        attributeValues: {
          create: attributeValues.map((value) => ({ attributeValueId: value.id })),
        },
      },
    });
  }
}

async function main() {
  await seedAdmin();
  await seedCategories();
  await seedBrands();
  await seedAttributes();
  await seedProducts();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
