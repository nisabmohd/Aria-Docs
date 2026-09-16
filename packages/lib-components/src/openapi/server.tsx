"use client"

import { Server } from "lucide-react"
import { cn } from "../lib/utils.js"
import { useOpenAPIContext } from "./context.js"

export interface OpenAPIServerProps {
  className?: string
}

/**
 * `<OpenAPI.Server>` — lists the API's base URLs (servers). Server variables
 * are shown with their defaults.
 */
export function OpenAPIServer({ className }: OpenAPIServerProps) {
  const { api } = useOpenAPIContext()

  if (api.servers.length === 0) {
    return null
  }

  return (
    <div data-slot="openapi-server" className={cn("space-y-1.5", className)}>
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
        <Server className="size-3" />
        Servers
      </div>
      {api.servers.map((server) => {
        const variables = Object.entries(server.variables)
        return (
          <div key={server.url} className="text-xs">
            <code className="text-foreground bg-muted rounded px-1.5 py-0.5 font-mono">
              {server.url}
            </code>
            {server.description !== undefined ? (
              <span className="text-muted-foreground ml-2">{server.description}</span>
            ) : null}
            {variables.map(([name, variable]) => (
              <span key={name} className="text-muted-foreground/70 ml-2 font-mono text-[10px]">
                {"{"}
                {name}
                {"}"}={variable.default ?? variable.enum?.[0] ?? ""}
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}
