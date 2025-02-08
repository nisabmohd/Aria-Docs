import { Locale, locales } from "@/lib/locale";
import { usePathname } from "next/navigation";

export default function useLocale() {
    const pathname = usePathname();
    return getLocale(pathname);
}

function getLocale(pathname: string) {
    const [locale] = pathname.split("/").filter(Boolean);
    return locales.includes(locale as Locale) ? locale : locales[0];
}
