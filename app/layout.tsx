import type { Metadata } from "next";
import { CartProvider } from "@/components/cart/cart-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { getCurrentLocale } from "@/lib/i18n/locale";
import { absoluteUrl, defaultSeo, getSiteUrl, openGraphLocales, organizationJsonLd, seoDescriptions, seoKeywords, siteName, websiteJsonLd } from "@/lib/seo/site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const description = seoDescriptions[locale] ?? defaultSeo.description;

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: defaultSeo.title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: seoKeywords,
    applicationName: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: openGraphLocales[locale],
      siteName,
      title: defaultSeo.title,
      description,
      url: getSiteUrl(),
      images: [
        {
          url: absoluteUrl(defaultSeo.image),
          width: 1200,
          height: 800,
          alt: "BogerdPro vestuario laboral y EPI",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultSeo.title,
      description,
      images: [absoluteUrl(defaultSeo.image)],
    },
    icons: {
      icon: "/brand/favicon.png",
      shortcut: "/brand/favicon.png",
      apple: "/brand/favicon.png",
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getCurrentLocale();

  return (
    <html lang={locale}>
      <body suppressHydrationWarning>
        <SessionProvider>
          <JsonLd data={[organizationJsonLd(), websiteJsonLd(seoDescriptions[locale])]} />
          <CartProvider>{children}</CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
