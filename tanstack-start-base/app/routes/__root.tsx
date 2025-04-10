import type { PropsWithChildren } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import appCss from "@/styles/app.css?url";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { getThemeServerFn } from "@/lib/theme";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "AriaDocs - Template",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css",
        type: "text/css",
      },
      {
        rel: "icon",
        type: "image/x-icon",
        href: "https://ariadocs.vercel.app/favicon.ico",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap",
      },
    ],
  }),
  component: RootComponent,
  loader: () => getThemeServerFn(),
});

function RootComponent() {
  const data = Route.useLoaderData();
  return (
    <ThemeProvider theme={data}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ThemeProvider>
  );
}

function RootDocument({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  return (
    <html className={theme}>
      <head>
        <HeadContent />
      </head>
      <body className="font-regular antialiased tracking-wide">
        <Navbar />
        <main className="sm:container mx-auto w-[90vw] h-auto scroll-smooth">
          {children}
        </main>
        <Footer />
        <Scripts />
      </body>
    </html>
  );
}
