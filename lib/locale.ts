export const locales = ["en", "fr", "ja"] as const;

export type Locale = typeof locales[number];

export function getLocale(pathname: string) {
    const [locale] = pathname.split("/").filter(Boolean);
    return locales.includes(locale as Locale) ? locale : locales[0];
}

export function pathnameHasLocale(pathname: string) {
    return locales.some(
        (locale) =>
            pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    );
}
