import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FloatingCart } from "@/components/cart/floating-cart";
import { getSiteContent } from "@/config/site-content";
import { getCurrentDictionary, getCurrentLocale } from "@/lib/i18n/locale";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale();
  const dictionary = await getCurrentDictionary();
  const siteContent = getSiteContent(locale);
  const navigationCollections = siteContent.catalogCollections.map(({ title, href, description }) => ({
    title,
    href,
    description,
  }));

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#151515]">
      <Header locale={locale} labels={dictionary.nav} collections={navigationCollections} />
      <main>{children}</main>
      <FloatingCart />
      <Footer labels={dictionary.footer} collections={navigationCollections} contactInfo={siteContent.contactInfo} />
    </div>
  );
}
