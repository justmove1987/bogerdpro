export const colorGroupKeys = [
  "black",
  "white",
  "grey",
  "navy",
  "blue",
  "red",
  "green",
  "yellow",
  "orange",
  "pink",
  "purple",
  "beige",
  "brown",
  "multicolor",
] as const;

export const sizeGroupKeys = [
  "xxs-xs",
  "s",
  "m",
  "l",
  "xl",
  "2xl",
  "3xl-plus",
  "junior",
  "pants",
  "footwear",
  "one-size",
] as const;

export const materialGroupKeys = [
  "cotton",
  "polyester",
  "polyamide",
  "stretch",
  "softshell",
  "fleece",
  "leather",
  "technical-coating",
  "rubber",
  "metal",
  "wood",
  "paper-cardboard",
] as const;

export type ColorGroupKey = (typeof colorGroupKeys)[number];
export type SizeGroupKey = (typeof sizeGroupKeys)[number];
export type MaterialGroupKey = (typeof materialGroupKeys)[number];

function normalized(value?: string | null) {
  return value
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesAny(value: string, tokens: string[]) {
  return tokens.some((token) => value.includes(token));
}

export function normalizeColorGroup(color?: string | null): ColorGroupKey | null {
  const value = normalized(color);
  if (!value) return null;
  if (value.includes("/") || value.includes("-")) return "multicolor";
  if (/^\d+$/.test(value)) return null;

  if (includesAny(value, ["negro", "black", "noir", "schwarz"])) return "black";
  if (includesAny(value, ["blanco", "white", "tofu", "birch"])) return "white";
  if (includesAny(value, ["marino", "navy"])) return "navy";
  if (includesAny(value, ["azul", "blue", "cobolt", "royal", "ocean", "sky"])) return "blue";
  if (includesAny(value, ["gris", "grey", "gray", "charcoal", "antracita", "plaster"])) return "grey";
  if (includesAny(value, ["rojo", "red", "burdeos", "cerise"])) return "red";
  if (includesAny(value, ["verde", "green", "moss", "forest", "leaf", "olive"])) return "green";
  if (includesAny(value, ["amarillo", "yellow", "limon", "lime", "neon"])) return "yellow";
  if (includesAny(value, ["naranja", "orange", "blaze"])) return "orange";
  if (includesAny(value, ["rosa", "pink"])) return "pink";
  if (includesAny(value, ["lila", "purple", "violet"])) return "purple";
  if (includesAny(value, ["beige", "khaki", "sand", "piedra", "taupe", "hay"])) return "beige";
  if (includesAny(value, ["marron", "brown"])) return "brown";

  return null;
}

export function normalizeSizeGroup(size?: string | null): SizeGroupKey | null {
  const value = normalized(size);
  if (!value) return null;
  const compact = value.replace(/\s+/g, "");

  if (["ud", "one", "onesize", "one-size", "unica", "unico", "tallaunica"].includes(compact)) return "one-size";
  if (/\b(anos|a\u00f1os|junior)\b/.test(value) || /^(100|110|120|130|140|150|160)\b/.test(compact)) return "junior";
  if (/^c\d+/.test(compact) || /^d\d+/.test(compact) || /^\d{4}$/.test(compact) || /^\d{2}\/\d{2}$/.test(compact)) return "pants";
  if (/^\d+([,.]\d+)?\(\d+([,.]\d+)?\)$/.test(compact) || /^(3|3,5|4|4,5|5|5,5|6|6,5|7|7,5|8|8,5|9|9,5|10|10,5|11|11,5|12|13|14)$/.test(compact)) return "footwear";
  if (/^(35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50)$/.test(compact)) return "footwear";
  if (["xxs", "xs", "xs/s"].includes(compact)) return "xxs-xs";
  if (["s", "s/m"].includes(compact)) return "s";
  if (compact === "m") return "m";
  if (["l", "l/xl"].includes(compact)) return "l";
  if (compact === "xl") return "xl";
  if (["xxl", "2xl"].includes(compact)) return "2xl";
  if (/^(3xl|4xl|5xl|6xl|7xl|8xl|9xl)/.test(compact)) return "3xl-plus";

  return null;
}

export function normalizeMaterialGroup(material?: string | null): MaterialGroupKey | null {
  const value = normalized(material);
  if (!value || value === "." || value === "#n/d" || value === "n/d") return null;

  if (includesAny(value, ["algodon", "cotton"])) return "cotton";
  if (includesAny(value, ["poliester", "polyester", "reciclado", "recycled"])) return "polyester";
  if (includesAny(value, ["poliamida", "polyamide", "nylon"])) return "polyamide";
  if (includesAny(value, ["elastano", "elastane", "spandex", "stretch"])) return "stretch";
  if (includesAny(value, ["softshell"])) return "softshell";
  if (includesAny(value, ["polar", "fleece"])) return "fleece";
  if (includesAny(value, ["piel", "cuero", "leather", "serraje", "nobuck", "nubuck"])) return "leather";
  if (includesAny(value, ["poliuretano", "polyurethane", "pvc", "nitrilo", "nitrile", "latex", "neopreno", "neoprene", "vinilo", "vinyl", "acrilica", "acrylic"])) return "technical-coating";
  if (includesAny(value, ["caucho", "rubber", "goma", "eva", "tpr"])) return "rubber";
  if (includesAny(value, ["metal", "acero", "steel", "aluminio", "aluminium", "zamak"])) return "metal";
  if (includesAny(value, ["madera", "wood"])) return "wood";
  if (includesAny(value, ["papel", "paper", "carton", "cardboard"])) return "paper-cardboard";

  return null;
}
