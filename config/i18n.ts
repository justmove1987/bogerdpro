export const defaultLocale = "es";

export const locales = [
  { code: "es", label: "Español", shortLabel: "ES" },
  { code: "ca", label: "Català", shortLabel: "CA" },
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "nl", label: "Nederlands", shortLabel: "NL" },
] as const;

export type Locale = (typeof locales)[number]["code"];
