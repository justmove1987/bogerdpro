import type { Locale } from "@/config/i18n";

export const siteName = "BogerdPro";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export const defaultSeo = {
  title: "BogerdPro | Vestuario laboral y EPI para empresas",
  description:
    "Catálogos profesionales, vestuario laboral, calzado de trabajo y equipos de protección individual para empresas.",
  image: "/images/hero/alta-visibilidad-construccion.jpg",
};

export const seoDescriptions: Record<Locale, string> = {
  es: "Vestuario laboral, calzado de trabajo y equipos de protección individual para empresas. Catálogos profesionales, compra B2B y asesoramiento especializado.",
  ca: "Vestuari laboral, calcat de treball i equips de proteccio individual per a empreses. Catalegs professionals, compra B2B i assessorament especialitzat.",
  en: "Workwear, safety footwear and personal protective equipment for companies. Professional catalogs, B2B purchasing and specialist advice.",
  nl: "Werkkleding, veiligheidsschoenen en persoonlijke beschermingsmiddelen voor bedrijven. Professionele catalogi, B2B-aankoop en gespecialiseerd advies.",
};

export const seoKeywords = [
  "vestuario laboral",
  "ropa de trabajo",
  "EPI",
  "equipos de protección individual",
  "calzado de seguridad",
  "alta visibilidad",
  "uniformes profesionales",
  "BogerdPro",
];

export const openGraphLocales: Record<Locale, string> = {
  es: "es_ES",
  ca: "ca_ES",
  en: "en_GB",
  nl: "nl_NL",
};

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: getSiteUrl(),
    logo: absoluteUrl("/brand/logo-bogerdpro.png"),
    email: "rbogerd@bogerdpro.com",
    telephone: "+34621228709",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. Montgo 68 B",
      postalCode: "17130",
      addressLocality: "L'Escala",
      addressRegion: "Girona",
      addressCountry: "ES",
    },
  };
}

export function websiteJsonLd(description = defaultSeo.description) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: getSiteUrl(),
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
