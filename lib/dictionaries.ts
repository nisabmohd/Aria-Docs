import { Locale } from "./locale";

export type LangProps = { params: Promise<{ lang: Locale }> };

const dictionaries = {
    en: () => import("@/dictionaries/en.json").then((module) => module.default),
    ja: () => import("@/dictionaries/ja.json").then((module) => module.default),
    fr: () => import("@/dictionaries/fr.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
