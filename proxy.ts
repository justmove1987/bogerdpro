import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, localeCookieName } from "@/config/i18n";

export function proxy(request: NextRequest) {
  const requestedLocale = request.nextUrl.searchParams.get("lang");

  if (!requestedLocale) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.searchParams.delete("lang");
  const response = NextResponse.redirect(url);
  response.cookies.set(localeCookieName, isLocale(requestedLocale) ? requestedLocale : defaultLocale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
