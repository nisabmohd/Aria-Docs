"use client"

import { getServerUrl } from "@ariadocs/openapi"
import { cn } from "../lib/utils.js"
import { Markdown } from "../markdown.js"
import { useOpenAPI } from "./context.js"
import { OpenAPISecurity } from "./security.js"
import { OpenAPIServer } from "./server.js"
import { Section } from "./section.js"

/** `<OpenAPI.Info>` — API title, version, description, servers, auth and links. */
export function OpenAPIInfo({ className }: { className?: string }) {
  const { api } = useOpenAPI()
  const { info } = api
  const links = [
    info.contact?.url !== undefined ? { href: info.contact.url, label: info.contact.name ?? "Support" } : undefined,
    info.contact?.email !== undefined ? { href: `mailto:${info.contact.email}`, label: info.contact.email } : undefined,
    info.license !== undefined
      ? { href: info.license.url, label: `License: ${info.license.name ?? info.license.identifier ?? "see link"}` }
      : undefined,
    info.termsOfService !== undefined ? { href: info.termsOfService, label: "Terms of service" } : undefined,
    api.externalDocs !== undefined ? { href: api.externalDocs.url, label: api.externalDocs.description ?? "External docs" } : undefined,
  ].filter((link) => link !== undefined)

  return (
    <div data-slot="openapi-info" className={cn("space-y-8", className)}>
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono text-(length:--aria-text-xs)">v{info.version}</span>
          <span className="text-muted-foreground rounded-full border px-2 py-0.5 font-mono text-(length:--aria-text-xs)">OpenAPI {api.version}</span>
        </div>
        <h1 className="text-foreground text-(length:--aria-text-2xl) font-semibold tracking-tight">{info.title}</h1>
        {info.summary !== undefined ? <p className="text-muted-foreground text-(length:--aria-text-lg)">{info.summary}</p> : null}
        <Markdown className="text-(length:--aria-text-base)">{info.description}</Markdown>
        {links.length > 0 ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-(length:--aria-text-sm)">
            {links.map((link) =>
              link.href !== undefined ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  {link.label}
                </a>
              ) : (
                <span key={link.label} className="text-muted-foreground">
                  {link.label}
                </span>
              )
            )}
          </div>
        ) : null}
      </header>

      <Section title="Base URL" id="base-url">
        <OpenAPIServer servers={api.servers} />
        {api.servers.some((server) => getServerUrl(server) !== server.url) ? (
          <p className="text-muted-foreground mt-2 text-(length:--aria-text-xs)">Server variables are filled in with their defaults.</p>
        ) : null}
      </Section>

      <OpenAPISecurity security={api.security} />
    </div>
  )
}
