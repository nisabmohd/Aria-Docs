// import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "@workspace/ui/globals.css";

import "@ariadocs/react/syntax.css";

// const fontSans = Geist({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });

// const fontMono = Geist_Mono({
//   subsets: ["latin"],
//   variable: "--font-mono",
// });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased `}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
