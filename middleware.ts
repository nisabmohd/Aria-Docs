import { NextRequest, NextResponse } from "next/server";
import { Locale, locales } from "./lib/locale";

function getLocale(request: NextRequest) {
    const [locale] = request.nextUrl.pathname.split("/").filter(Boolean);
    return locales.includes(locale as Locale) ? locale : locales[0];
}

export function middleware(request: NextRequest) {
    // Check if there is any supported locale in the pathname
    const { pathname } = request.nextUrl;
    const pathnameHasLocale = locales.some(
        (locale) =>
            pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    );

    if (pathnameHasLocale) return;

    // Redirect if there is no locale
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    // e.g. incoming request is /docs/get-started
    // The new URL is now /en/docs/get-started
    return NextResponse.redirect(request.nextUrl);
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        "/((?!_next).*)",
        // Optional: only run on root (/) URL
        // '/'
    ],
};
