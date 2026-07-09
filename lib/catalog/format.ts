export function formatPrice(cents?: number | null, currency = "EUR") {
  if (typeof cents !== "number") {
    return "Consultar";
  }

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatPriceRange(min?: number | null, max?: number | null, currency = "EUR") {
  if (typeof min !== "number") {
    return "Consultar";
  }

  if (typeof max === "number" && max !== min) {
    return `Desde ${formatPrice(min, currency)}`;
  }

  return formatPrice(min, currency);
}
