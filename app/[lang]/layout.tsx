import type { Metadata } from "next";
import { ThemeProvider } from "@/components/contexts/theme-provider";
import { Navbar } from "@/components/navbar";
import { Space_Mono, Space_Grotesk } from "next/font/google";
import { Footer } from "@/components/footer";
import { getDictionary, LangProps } from "@/lib/dictionaries";
import { ClientDictionary } from "@/components/contexts/dictionary-provider";
import { locales } from "@/lib/locale";
import "@/styles/globals.css";

const sansFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  weight: "400",
});

const monoFont = Space_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  weight: "400",
});

export async function generateMetadata(params: LangProps): Promise<Metadata> {
  const { lang } = await params.params;
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.title,
    metadataBase: new URL("https://ariadocs.vercel.app/"),
    description: dict.metadata.description,
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<
  {
    children: React.ReactNode;
  } & LangProps
>) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${sansFont.variable} ${monoFont.variable} font-regular antialiased tracking-wide`}
        suppressHydrationWarning
      >
        <ClientDictionary dict={dict}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar dict={dict} />
            <main className="sm:container mx-auto w-[90vw] h-auto scroll-smooth">
              {children}
            </main>
            <Footer dict={dict} />
          </ThemeProvider>
        </ClientDictionary>
      </body>
    </html>
  );
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}
