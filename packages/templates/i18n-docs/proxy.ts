import { NextRequest, NextResponse } from "next/server";
import { getLocale } from "./lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, hasLocale } = getLocale(pathname);

  if (!hasLocale) {
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }
}

export const config = {
  matcher: ["/((?!_next).*)"],
};
