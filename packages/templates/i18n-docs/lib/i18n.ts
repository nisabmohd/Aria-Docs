const dictionaries = {
  en: () => import("@/dict/en.json").then((module) => module.default),
  ja: () => import("@/dict/ja.json").then((module) => module.default),
} as const;

export type Dict = Awaited<ReturnType<(typeof dictionaries)["en"]>>;
export type Locale = keyof typeof dictionaries;
export const locales = Object.keys(dictionaries) as Locale[];

export const getDictionary = async (locale: string) => {
  let l = locale as Locale;
  if (!locales.includes(l)) return dictionaries[locales[0]]();
  return dictionaries[l]();
};

export function getLocale(pathname: string): {
  locale: Locale;
  hasLocale: boolean;
} {
  const [firstSegment] = pathname.split("/").filter(Boolean);
  const isSupported = locales.includes(firstSegment as Locale);
  return {
    locale: isSupported ? (firstSegment as Locale) : locales[0],
    hasLocale: isSupported,
  };
}

export type LangProps = { params: Promise<{ locale: string }> };
