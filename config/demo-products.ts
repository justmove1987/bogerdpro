export type DemoProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  reference: string;
  availability: "En stock" | "Bajo pedido" | "Consultar";
  image: string;
  imageAlt: string;
  description: string;
};

export const featuredProducts: DemoProduct[] = [
  {
    slug: "chaqueta-alta-visibilidad",
    name: "Chaqueta técnica de alta visibilidad",
    brand: "BogerdPro",
    category: "Alta visibilidad",
    price: "129,00 EUR",
    reference: "BP-AV-STD",
    availability: "En stock",
    image: "/images/hero/alta-visibilidad-construccion.jpg",
    imageAlt: "Chaqueta técnica de alta visibilidad en obra",
    description: "Prenda profesional preparada para entornos de baja visibilidad, con diseño funcional y certificación técnica.",
  },
  {
    slug: "calzado-seguridad-premium",
    name: "Calzado de seguridad premium",
    brand: "BogerdPro",
    category: "Calzado de trabajo",
    price: "89,00 EUR",
    reference: "BP-CAL-S3",
    availability: "Bajo pedido",
    image: "/images/sectors/calzado-seguridad-negro.jpg",
    imageAlt: "Calzado de seguridad negro con detalles técnicos",
    description: "Calzado resistente y cómodo para jornadas intensivas, pensado para seguridad, estabilidad y durabilidad.",
  },
  {
    slug: "pantalon-industrial-reforzado",
    name: "Pantalón industrial reforzado",
    brand: "BogerdPro",
    category: "Industria y logística",
    price: "54,50 EUR",
    reference: "BP-IND-TR",
    availability: "En stock",
    image: "/images/products/rodillera-pantalon-tecnico.jpg",
    imageAlt: "Pantalón industrial reforzado con rodillera técnica",
    description: "Vestuario laboral técnico con refuerzos, patronaje cómodo y materiales pensados para uso profesional.",
  },
];
