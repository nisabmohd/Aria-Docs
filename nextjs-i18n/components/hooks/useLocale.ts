import { getLocale } from "@/lib/locale";
import { usePathname } from "next/navigation";

export default function useLocale() {
    const pathname = usePathname();
    return getLocale(pathname);
}
