import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import NotFound from "./components/not-found";
import ErrorComp from "./components/error";
import { not_found } from "./lib/utils";
import "./styles/app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css",
    type: "text/css",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-regular antialiased tracking-wide">
        <Navbar />
        <main className="sm:container mx-auto w-[90vw] h-auto scroll-smooth">
          {children}
        </main>
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (
    (isRouteErrorResponse(error) && error.status === 404) ||
    (error instanceof Error && error.message == not_found)
  ) {
    return <NotFound />;
  }
  return <ErrorComp error={error} />;
}
