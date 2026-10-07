"use client"

import type { APISecurityRequirement, APISecurityScheme } from "@ariadocs/openapi"
import { getOwn } from "@ariadocs/core"
import { cn } from "../lib/utils.js"
import { Markdown } from "../markdown.js"
import { useOptionalOperation, useOptionalOpenAPI } from "./context.js"
import { FieldHeader } from "./schema.js"
import { anchorId } from "./anchor.js"
import { Section } from "./section.js"

export interface OpenAPISecurityProps {
  /** Defaults to the current operation's requirements (or the API's global ones). */
  security?: APISecurityRequirement[]
  className?: string
}

/**
 * `<OpenAPI.Security>` — how to authenticate: one field per scheme (e.g.
 * `Authorization` header, `X-API-Key`). Alternatives are listed as "or".
 */
export function OpenAPISecurity({ security, className }: OpenAPISecurityProps) {
  const root = useOptionalOpenAPI()
  const operation = useOptionalOperation()
  const requirements = security ?? operation?.security ?? root?.api.security ?? []
  if (requirements.length === 0) return null

  const optional = requirements.some((requirement) => requirement.schemes.length === 0)
  const alternatives = requirements.filter((requirement) => requirement.schemes.length > 0)
  if (alternatives.length === 0) return null

  return (
    <Section
      title="Authorization"
      id={anchorId(operation?.id, "authorization")}
      className={className}
      aside={optional ? <span className="text-muted-foreground text-(length:--aria-text-xs)">optional</span> : null}
    >
      <div className="divide-border divide-y">
        {alternatives.map((requirement, index) => (
          <div key={index} className="py-3 first:pt-1 last:pb-1">
            {index > 0 ? <p className="text-muted-foreground mb-2 text-(length:--aria-text-xs) uppercase">or</p> : null}
            <div className="space-y-3">
              {requirement.schemes.map(({ name, scopes }) => (
                <SecuritySchemeField
                  key={name}
                  name={name}
                  scheme={root !== null ? getOwn(root.api.securitySchemes, name) : undefined}
                  scopes={scopes}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function SecuritySchemeField({ name, scheme, scopes }: { name: string; scheme?: APISecurityScheme; scopes: string[] }) {
  const { field, location, hint } = describeScheme(name, scheme)
  return (
    <div>
      <FieldHeader name={field} type={location} required />
      <Markdown className="mt-1">{hint}</Markdown>
      <Markdown className="mt-1">{scheme?.description}</Markdown>
      {scopes.length > 0 ? (
        <p className="text-muted-foreground mt-1 text-(length:--aria-text-xs)">
          Scopes:{" "}
          {scopes.map((scope) => (
            <code key={scope} className="bg-muted text-foreground mr-1 rounded px-1 font-mono text-(length:--aria-text-xs)">
              {scope}
            </code>
          ))}
        </p>
      ) : null}
    </div>
  )
}

function describeScheme(name: string, scheme?: APISecurityScheme): { field: string; location: string; hint: string } {
  if (scheme === undefined) return { field: name, location: "unknown scheme", hint: `Security scheme "${name}".` }
  switch (scheme.type) {
    case "apiKey":
      return { field: scheme.name ?? name, location: scheme.in ?? "header", hint: `API key (${name}).` }
    case "http":
      return scheme.scheme === "basic"
        ? { field: "Authorization", location: "header", hint: "Basic authentication: `Basic <base64(user:password)>`." }
        : {
            field: "Authorization",
            location: "header",
            hint: `${scheme.scheme === "bearer" ? "Bearer" : (scheme.scheme ?? "HTTP")} authentication${scheme.bearerFormat !== undefined ? ` (${scheme.bearerFormat})` : ""}: \`Bearer <token>\`.`,
          }
    case "oauth2":
      return { field: "Authorization", location: "header", hint: `OAuth 2.0 access token (${name}): \`Bearer <token>\`.` }
    case "openIdConnect":
      return { field: "Authorization", location: "header", hint: `OpenID Connect token (${name}).` }
    case "mutualTLS":
      return { field: name, location: "mutual TLS", hint: "Client certificate required." }
  }
}

export function SecurityBadges({ className }: { className?: string }) {
  const operation = useOptionalOperation()
  const names = [...new Set((operation?.security ?? []).flatMap((r) => r.schemes.map((s) => s.name)))]
  if (names.length === 0) return null
  return (
    <span className={cn("text-muted-foreground inline-flex gap-1 text-(length:--aria-text-xs)", className)}>
      {names.map((name) => (
        <span key={name} className="rounded border px-1.5 py-px font-mono">
          {name}
        </span>
      ))}
    </span>
  )
}
