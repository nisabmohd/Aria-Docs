import { Navbar } from "@/components/navbar";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/footer";
import ThemeContextProvider from "@/components/theme";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Docs Starter Template",
  description:
    "Get started with documentation quickly using this template. It provides a structured foundation for creating clear and organized project documentation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} dark:bg-zinc-950 dark:text-zinc-200`}
      >
        <ThemeContextProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <Navbar />

          <main className="w-[60%] mx-auto py-8 max-[1300px]:w-[90%] max-[800px]:w-[92%] ">
            {children}
          </main>
          <Footer />
        </ThemeContextProvider>
      </body>
    </html>
  );
}
