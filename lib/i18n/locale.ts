import { cookies } from "next/headers";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/config/i18n";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(localeCookieName)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export async function getCurrentDictionary() {
  return getDictionary(await getCurrentLocale());
}
