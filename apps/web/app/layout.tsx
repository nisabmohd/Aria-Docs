import { Host_Grotesk,JetBrains_Mono} from "next/font/google";
import { Providers } from "@/components/providers";
import "@workspace/ui/globals.css";
import "@ariadocs/react/styles/minimal.css";

const sans = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight:"400"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${mono.variable} font-sans antialiased mx-auto max-w-2xl px-4 py-10`}
      >
        <Providers>
          {children}</Providers>
      </body>
    </html>
  );
}
