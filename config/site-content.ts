import { BriefcaseBusiness, Building2, ChefHat, Footprints, HardHat, HeartPulse, ShieldCheck, Shirt } from "lucide-react";
import type { Locale } from "@/config/i18n";

export const catalogCollections = [
  {
    title: "Catálogos generales",
    href: "/catalog#catalogos-generales",
    sourceUrl: "https://bogerdpro.com/catalogos-generales/",
    description: "Colecciones completas de vestuario laboral y EPI para compra profesional.",
    image: "/images/catalogs/construccion-workwear-negro.jpg",
    imageAlt: "Profesional con vestuario laboral en obra",
    icon: BriefcaseBusiness,
  },
  {
    title: "Alta visibilidad",
    href: "/catalog#alta-visibilidad",
    sourceUrl: "https://bogerdpro.com/alta-visibilidad/",
    description: "Prendas técnicas para entornos donde la visibilidad es crítica.",
    image: "/images/catalogs/alta-visibilidad-equipo.jpg",
    imageAlt: "Equipo con chaquetas de alta visibilidad",
    icon: ShieldCheck,
  },
  {
    title: "Calzado de trabajo",
    href: "/catalog#calzado-de-trabajo",
    sourceUrl: "https://bogerdpro.com/calzado-de-trabajo/",
    description: "Calzado profesional resistente, cómodo y certificado.",
    image: "/images/sectors/calzado-seguridad-terreno.jpg",
    imageAlt: "Detalle de pantalón técnico con rodillera",
    icon: Footprints,
  },
  {
    title: "Equipos de protección",
    href: "/catalog#equipos-de-proteccion",
    sourceUrl: "https://bogerdpro.com/equipos-de-proteccion/",
    description: "EPI y soluciones de seguridad para equipos exigentes.",
    image: "/images/sectors/soldadura-taller.jpg",
    imageAlt: "Profesional soldando con equipo de protección",
    icon: HardHat,
  },
  {
    title: "Hostelería y restauración",
    href: "/catalog#hosteleria-y-restauracion",
    sourceUrl: "https://bogerdpro.com/hosteleria-y-restauracion/",
    description: "Vestuario funcional, elegante y duradero para servicio profesional.",
    image: "/images/catalogs/category-hosteleria.png",
    imageAlt: "Detalle de pantalón técnico profesional",
    icon: ChefHat,
  },
  {
    title: "Industria, construcción y logística",
    href: "/catalog#industria-construccion-y-logistica",
    sourceUrl: "https://bogerdpro.com/industria-construccion-y-logistica/",
    description: "Prendas y protección para jornadas intensivas y entornos técnicos.",
    image: "/images/sectors/planta-industrial-operario.jpg",
    imageAlt: "Profesionales trabajando en entorno industrial",
    icon: Building2,
  },
  {
    title: "Sanidad y servicios",
    href: "/catalog#sanidad-y-servicios",
    sourceUrl: "https://bogerdpro.com/sanidad-y-servicios/",
    description: "Uniformidad profesional para equipos asistenciales y servicios.",
    image: "/images/sectors/industria-alimentaria-proteccion.jpg",
    imageAlt: "Vestuario profesional con casco de seguridad",
    icon: HeartPulse,
  },
  {
    title: "Sport, casual, promo y eventos",
    href: "/catalog#sport-casual-promo-y-eventos",
    sourceUrl: "https://bogerdpro.com/sport-casual-promo-y-eventos/",
    description: "Imagen corporativa, promoción y prendas para equipos visibles.",
    image: "/images/catalogs/alta-visibilidad-naranja.jpg",
    imageAlt: "Prenda naranja de alta visibilidad",
    icon: Shirt,
  },
];

export const valuePillars = [
  {
    title: "Más de 20 años de experiencia",
    text: "Conocemos las necesidades reales de cada sector y ofrecemos soluciones probadas y efectivas.",
  },
  {
    title: "Productos de alta calidad",
    text: "Trabajamos con primeras marcas y materiales duraderos que garantizan seguridad, comodidad y diseño.",
  },
  {
    title: "Asesoramiento personalizado",
    text: "Acompañamos a cada empresa para encontrar la mejor opción para su equipo.",
  },
  {
    title: "Compromiso con la innovación",
    text: "Incorporamos novedades del sector para ofrecer protección, imagen y funcionalidad actualizadas.",
  },
];

export const productBenefits = ["Calidad certificada", "Comodidad y funcionalidad", "Durabilidad garantizada", "Imagen impecable"];

export const workEnvironments = [
  {
    title: "Soldadura y metal",
    text: "Protección térmica, facial y guantes para trabajos con riesgo mecánico y proyecciones.",
    image: "/images/sectors/soldadura-taller.jpg",
    imageAlt: "Profesional soldando en taller",
  },
  {
    title: "Trabajos en altura",
    text: "EPI y vestuario técnico para equipos que trabajan en fachada, cubierta o estructura.",
    image: "/images/sectors/trabajos-altura-fachada.jpg",
    imageAlt: "Profesionales realizando trabajos en altura",
  },
  {
    title: "Construcción",
    text: "Alta visibilidad, cascos, guantes, calzado y prendas resistentes para obra.",
    image: "/images/sectors/construccion-casco-naranja.jpg",
    imageAlt: "Profesional de construcción con casco naranja",
  },
  {
    title: "Industria alimentaria",
    text: "Protección higiénica, prendas desechables y equipos para procesos controlados.",
    image: "/images/sectors/industria-alimentaria-proteccion.jpg",
    imageAlt: "Operario con protección en industria alimentaria",
  },
  {
    title: "Automoción e industria",
    text: "Soluciones para líneas de producción, mantenimiento y entornos técnicos.",
    image: "/images/sectors/automocion-linea-produccion.jpg",
    imageAlt: "Línea de producción industrial",
  },
  {
    title: "Calzado profesional",
    text: "Botas y zapatos de seguridad para terreno, maquinaria, humedad y uso intensivo.",
    image: "/images/sectors/calzado-seguridad-terreno.jpg",
    imageAlt: "Calzado de seguridad en terreno de obra",
  },
];

export const companyStats = [
  { label: "años en el sector", value: "+20" },
  { label: "catálogos", value: "+12" },
  { label: "productos", value: "+3.000" },
];

export const contactInfo = {
  phone: "(+34) 621 22 87 09",
  email: "info@bogerdpro.com",
  office: "Av. Montgó 68 B, 17130 L'Escala, Girona, España",
};

const siteContentTranslations: Record<Locale, {
  collections: { title: string; description: string; imageAlt: string }[];
  pillars: { title: string; text: string }[];
  productBenefits: string[];
  stats: { label: string; value: string }[];
}> = {
  es: {
    collections: catalogCollections.map(({ title, description, imageAlt }) => ({ title, description, imageAlt })),
    pillars: valuePillars,
    productBenefits,
    stats: companyStats,
  },
  ca: {
    collections: [
      { title: "Catàlegs generals", description: "Col·leccions completes de vestuari laboral i EPI per a compra professional.", imageAlt: "Professional amb vestuari laboral en obra" },
      { title: "Alta visibilitat", description: "Peces tècniques per a entorns on la visibilitat és crítica.", imageAlt: "Equip amb jaquetes d'alta visibilitat" },
      { title: "Calçat de treball", description: "Calçat professional resistent, còmode i certificat.", imageAlt: "Detall de pantaló tècnic amb genollera" },
      { title: "Equips de protecció", description: "EPI i solucions de seguretat per a equips exigents.", imageAlt: "Professional soldant amb equip de protecció" },
      { title: "Hostaleria i restauració", description: "Vestuari funcional, elegant i durador per a servei professional.", imageAlt: "Detall de pantaló tècnic professional" },
      { title: "Indústria, construcció i logística", description: "Peces i protecció per a jornades intensives i entorns tècnics.", imageAlt: "Professionals treballant en entorn industrial" },
      { title: "Sanitat i serveis", description: "Uniformitat professional per a equips assistencials i serveis.", imageAlt: "Vestuari professional amb casc de seguretat" },
      { title: "Sport, casual, promo i esdeveniments", description: "Imatge corporativa, promoció i peces per a equips visibles.", imageAlt: "Peça taronja d'alta visibilitat" },
    ],
    pillars: [
      { title: "Més de 20 anys d'experiència", text: "Coneixem les necessitats reals de cada sector i oferim solucions provades i efectives." },
      { title: "Productes d'alta qualitat", text: "Treballem amb primeres marques i materials duradors que garanteixen seguretat, comoditat i disseny." },
      { title: "Assessorament personalitzat", text: "Acompanyem cada empresa per trobar la millor opció per al seu equip." },
      { title: "Compromís amb la innovació", text: "Incorporem novetats del sector per oferir protecció, imatge i funcionalitat actualitzades." },
    ],
    productBenefits: ["Qualitat certificada", "Comoditat i funcionalitat", "Durabilitat garantida", "Imatge impecable"],
    stats: [
      { label: "anys al sector", value: "+20" },
      { label: "catàlegs", value: "+12" },
      { label: "productes", value: "+3.000" },
    ],
  },
  en: {
    collections: [
      { title: "General catalogs", description: "Complete workwear and PPE collections for professional purchasing.", imageAlt: "Professional wearing workwear on site" },
      { title: "High visibility", description: "Technical garments for environments where visibility is critical.", imageAlt: "Team wearing high-visibility jackets" },
      { title: "Work footwear", description: "Resistant, comfortable and certified professional footwear.", imageAlt: "Detail of technical trousers with knee pad" },
      { title: "Protective equipment", description: "PPE and safety solutions for demanding teams.", imageAlt: "Professional welding with protective equipment" },
      { title: "Hospitality and catering", description: "Functional, elegant and durable clothing for professional service.", imageAlt: "Detail of professional technical trousers" },
      { title: "Industry, construction and logistics", description: "Garments and protection for intensive days and technical environments.", imageAlt: "Professionals working in an industrial environment" },
      { title: "Healthcare and services", description: "Professional uniforms for care teams and services.", imageAlt: "Professional clothing with safety helmet" },
      { title: "Sport, casual, promo and events", description: "Corporate image, promotion and garments for visible teams.", imageAlt: "Orange high-visibility garment" },
    ],
    pillars: [
      { title: "Over 20 years of experience", text: "We understand the real needs of each sector and offer proven, effective solutions." },
      { title: "High-quality products", text: "We work with leading brands and durable materials that deliver safety, comfort and design." },
      { title: "Personal advice", text: "We support each company in finding the best option for its team." },
      { title: "Commitment to innovation", text: "We bring in sector updates to offer current protection, image and functionality." },
    ],
    productBenefits: ["Certified quality", "Comfort and functionality", "Guaranteed durability", "Impeccable image"],
    stats: [
      { label: "years in the sector", value: "+20" },
      { label: "catalogs", value: "+12" },
      { label: "products", value: "+3,000" },
    ],
  },
  nl: {
    collections: [
      { title: "Algemene catalogi", description: "Complete collecties werkkleding en PBM voor professionele aankoop.", imageAlt: "Professional met werkkleding op een bouwplaats" },
      { title: "Hoge zichtbaarheid", description: "Technische kleding voor omgevingen waar zichtbaarheid cruciaal is.", imageAlt: "Team met hoge-zichtbaarheidsjassen" },
      { title: "Werkschoenen", description: "Sterk, comfortabel en gecertificeerd professioneel schoeisel.", imageAlt: "Detail van technische broek met kniebeschermer" },
      { title: "Beschermingsmiddelen", description: "PBM en veiligheidsoplossingen voor veeleisende teams.", imageAlt: "Professional aan het lassen met beschermingsmiddelen" },
      { title: "Horeca en catering", description: "Functionele, elegante en duurzame kleding voor professionele service.", imageAlt: "Detail van professionele technische broek" },
      { title: "Industrie, bouw en logistiek", description: "Kleding en bescherming voor intensieve werkdagen en technische omgevingen.", imageAlt: "Professionals aan het werk in een industriële omgeving" },
      { title: "Zorg en diensten", description: "Professionele uniformen voor zorgteams en dienstverleners.", imageAlt: "Professionele kleding met veiligheidshelm" },
      { title: "Sport, casual, promo en events", description: "Corporate uitstraling, promotie en kleding voor zichtbare teams.", imageAlt: "Oranje hoge-zichtbaarheidskleding" },
    ],
    pillars: [
      { title: "Meer dan 20 jaar ervaring", text: "We kennen de echte behoeften van elke sector en bieden bewezen, effectieve oplossingen." },
      { title: "Producten van hoge kwaliteit", text: "We werken met topmerken en duurzame materialen die veiligheid, comfort en design garanderen." },
      { title: "Persoonlijk advies", text: "We begeleiden elk bedrijf naar de beste optie voor zijn team." },
      { title: "Focus op innovatie", text: "We volgen sectorvernieuwingen om actuele bescherming, uitstraling en functionaliteit te bieden." },
    ],
    productBenefits: ["Gecertificeerde kwaliteit", "Comfort en functionaliteit", "Gegarandeerde duurzaamheid", "Onberispelijke uitstraling"],
    stats: [
      { label: "jaar in de sector", value: "+20" },
      { label: "catalogi", value: "+12" },
      { label: "producten", value: "+3.000" },
    ],
  },
};

export function getSiteContent(locale: Locale) {
  const translation = siteContentTranslations[locale] ?? siteContentTranslations.es;

  return {
    catalogCollections: catalogCollections.map((item, index) => ({
      ...item,
      ...translation.collections[index],
    })),
    valuePillars: translation.pillars,
    productBenefits: translation.productBenefits,
    companyStats: translation.stats,
    contactInfo,
  };
}
