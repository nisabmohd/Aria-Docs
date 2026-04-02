import { ClientDictionaryProvider } from "@/components/dict-provider";
import Navbar from "@/components/navbar";
import { getDictionary, LangProps, locales } from "@/lib/i18n";
import { PropsWithChildren } from "react";

export default async function LocaleLayout({
  children,
  params,
}: PropsWithChildren<LangProps>) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return (
    <ClientDictionaryProvider dict={dict}>
      <Navbar />
      <section className="px-4">{children}</section>
    </ClientDictionaryProvider>
  );
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
