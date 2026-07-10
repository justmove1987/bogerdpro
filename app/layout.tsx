import type { Metadata } from "next";
import { CartProvider } from "@/components/cart/cart-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { absoluteUrl, defaultSeo, getSiteUrl, siteName } from "@/lib/seo/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: defaultSeo.title,
    template: `%s | ${siteName}`,
  },
  description: defaultSeo.description,
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName,
    title: defaultSeo.title,
    description: defaultSeo.description,
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
    description: defaultSeo.description,
    images: [absoluteUrl(defaultSeo.image)],
  },
  icons: {
    icon: "/brand/favicon.png",
    shortcut: "/brand/favicon.png",
    apple: "/brand/favicon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>
          <CartProvider>{children}</CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
