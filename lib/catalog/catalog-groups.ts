export const catalogGroupKeys = [
  "general",
  "high-visibility",
  "footwear",
  "protective-equipment",
  "hospitality",
  "industry",
  "healthcare",
  "sport-promo",
] as const;

export type CatalogGroupKey = (typeof catalogGroupKeys)[number];

const groupTerms: Record<CatalogGroupKey, string[]> = {
  general: ["camiseta", "polo", "sudadera", "camisa", "chaqueta", "chaleco", "bolsa", "mochila", "gorra", "corporativo", "promocional"],
  "high-visibility": ["alta visibilidad", "hi vis", "hi-vis", "reflectante", "reflective", "fluor", "fluorescente", "visibility"],
  footwear: ["calzado", "zapato", "bota", "zapatilla", "footwear", "shoe", "boot", "safety shoe", "skechers"],
  "protective-equipment": ["epi", "protección", "protection", "guante", "casco", "gafa", "mascarilla", "arnés", "tapón", "rodillera", "helmet", "glove"],
  hospitality: ["hostelería", "restauración", "cocina", "chef", "delantal", "camarero", "cocinero", "horeca", "hospitality", "catering"],
  industry: ["industria", "industrial", "construcción", "logística", "workwear", "multibolsillos", "pantalón", "mono", "coverall", "softshell"],
  healthcare: ["sanidad", "sanitario", "salud", "clínica", "bata", "casaca", "pijama", "enfermería", "estética", "limpieza", "healthcare"],
  "sport-promo": ["sport", "deporte", "casual", "promo", "evento", "running", "fitness", "chándal", "bermuda", "short", "camiseta técnica"],
};

export function catalogGroupTerms(group: string) {
  return catalogGroupKeys.includes(group as CatalogGroupKey) ? groupTerms[group as CatalogGroupKey] : [];
}
