"use client"

import { getServerUrl, type APIServer } from "@ariadocs/openapi"
import { cn } from "../lib/utils.js"
import { useOptionalOperation, useOptionalOpenAPI } from "./context.js"

export interface OpenAPIServerProps {
  /** Defaults to the current operation's servers, else the API's. */
  servers?: APIServer[]
  className?: string
}

/** `<OpenAPI.Server>` — base URLs, with variables filled in from their defaults. */
export function OpenAPIServer({ servers, className }: OpenAPIServerProps) {
  const root = useOptionalOpenAPI()
  const operation = useOptionalOperation()
  const list = servers ?? operation?.servers ?? root?.api.servers ?? []
  if (list.length === 0) return null

  return (
    <ul data-slot="openapi-servers" className={cn("space-y-1.5 text-(length:--aria-text-sm)", className)}>
      {list.map((server) => (
        <li key={server.url} className="flex flex-wrap items-baseline gap-x-2">
          <code className="text-foreground bg-muted rounded px-1.5 py-0.5 font-mono text-(length:--aria-text-xs) break-all">
            {getServerUrl(server)}
          </code>
          {server.description !== undefined ? (
            <span className="text-muted-foreground text-(length:--aria-text-xs)">{server.description}</span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
