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
