export const locales = ["en", "fr", "ja"] as const;

export type Locale = typeof locales[number];
