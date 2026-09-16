"use client"

import type { APISecurityRequirement } from "@ariadocs/openapi"
import { Lock } from "lucide-react"
import { Badge } from "../ui/badge.js"
import { cn } from "../lib/utils.js"
import { useOpenAPIContext, useOptionalOperationContext } from "./context.js"

export interface OpenAPISecurityProps {
  /** Override the security requirements; defaults to the current operation's (or the API's global) security. */
  security?: APISecurityRequirement[]
  className?: string
}

/**
 * `<OpenAPI.Security>` — the security schemes required by the current
 * operation (or explicit/global requirements).
 */
export function OpenAPISecurity({ security, className }: OpenAPISecurityProps) {
  const root = useOpenAPIContext()
  const operation = useOptionalOperationContext()?.operation
  const requirements = security ?? operation?.security ?? []

  if (requirements.length === 0) {
    return null
  }

  const names = requirements.flatMap((requirement) =>
    requirement.schemes.map((scheme) => scheme.name)
  )

  return (
    <div data-slot="openapi-security" className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Lock className="text-muted-foreground size-3" />
      {names.map((name) => {
        const scheme = root.api.securitySchemes[name]
        return (
          <Badge key={name} variant="outline" className="gap-1 font-mono text-[10px]">
            {name}
            {scheme !== undefined ? (
              <span className="text-muted-foreground">({scheme.type})</span>
            ) : null}
          </Badge>
        )
      })}
    </div>
  )
}
