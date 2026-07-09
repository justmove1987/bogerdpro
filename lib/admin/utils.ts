export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function formNumber(formData: FormData, key: string) {
  const value = formString(formData, key);
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function eurosToCents(value?: number) {
  if (typeof value !== "number") return undefined;
  return Math.round(value * 100);
}

export function centsToEuros(value?: number | null) {
  if (typeof value !== "number") return "";
  return (value / 100).toFixed(2);
}
