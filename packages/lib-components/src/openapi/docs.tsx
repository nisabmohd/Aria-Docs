"use client"

import type { AriadocsOpenAPI } from "@ariadocs/openapi"
import { cn } from "../lib/utils.js"
import { useOpenAPIContext } from "./context.js"
import { OpenAPIContent, OpenAPILayout } from "./layout.js"
import { OpenAPIOperation } from "./operation.js"
import { OpenAPISchema } from "./schema.js"
import { OpenAPISecurity } from "./security.js"
import { OpenAPIServer } from "./server.js"
import { OpenAPISidebar } from "./sidebar.js"

export interface OpenAPIDocsProps {
  /** Show the navigation sidebar (default true). */
  showSidebar?: boolean
  /** Show the schemas section (default true). */
  showSchemas?: boolean
  className?: string
}

/**
 * `<OpenAPI.Docs>` — the complete, ready-made API reference experience:
 * sidebar + servers + every operation + schemas. Use it for zero-config, or
 * compose `<OpenAPI.Layout>` / `<OpenAPI.Operation>` yourself for control.
 */
export function OpenAPIDocs({
  showSidebar = true,
  showSchemas = true,
  className,
}: OpenAPIDocsProps) {
  const { api } = useOpenAPIContext()
  const schemaNames = Object.keys(api.schemas)

  return (
    <div data-slot="openapi-docs" className={cn("space-y-8", className)}>
      <header className="space-y-3">
        <h2 className="text-foreground text-2xl font-bold tracking-tight">
          {api.info.title}
        </h2>
        {api.info.description !== undefined ? (
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            {api.info.description}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground font-mono text-xs">
            {api.info.title} v{api.info.version}
          </span>
          <span className="text-muted-foreground font-mono text-xs">OpenAPI {api.version}</span>
        </div>
        <OpenAPIServer />
        <OpenAPISecurity security={api.security} />
      </header>

      <OpenAPILayout>
        {showSidebar ? <OpenAPISidebar /> : null}
        <OpenAPIContent>
          {api.groups.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-24 space-y-10">
              <div className="space-y-1">
                <h3 className="text-foreground text-lg font-semibold tracking-tight">
                  {group.name}
                </h3>
                {group.description !== undefined ? (
                  <p className="text-muted-foreground text-sm">{group.description}</p>
                ) : null}
              </div>
              {group.operations.map((operation) => (
                <OpenAPIOperation key={operation.id} operation={operation} />
              ))}
            </section>
          ))}

          {showSchemas && schemaNames.length > 0 ? (
            <section id="schemas" className="scroll-mt-24 space-y-4">
              <h3 className="text-foreground text-lg font-semibold tracking-tight">Schemas</h3>
              <div className="grid gap-4">
                {schemaNames.map((name) => (
                  <OpenAPISchema key={name} schema={api.schemas[name]} name={name} />
                ))}
              </div>
            </section>
          ) : null}
        </OpenAPIContent>
      </OpenAPILayout>
    </div>
  )
}

export type { AriadocsOpenAPI }
