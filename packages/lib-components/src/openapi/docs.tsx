"use client"

import { Markdown } from "../markdown.js"
import { cn } from "../lib/utils.js"
import { useOpenAPI } from "./context.js"
import { AnchorLink } from "./anchor.js"
import { OpenAPIInfo } from "./info.js"
import { OpenAPIOperation } from "./operation.js"
import { OpenAPISchema, SchemaTitle } from "./schema.js"
import { OpenAPISidebar } from "./sidebar.js"

export interface OpenAPIDocsProps {
  /** Show the sidebar (default `true`). */
  showSidebar?: boolean
  /** Show the schemas section (default `true`). */
  showSchemas?: boolean
  className?: string
}

/**
 * `<OpenAPI.Docs>` — a complete single-page API reference: info, every
 * operation grouped by tag, and schemas. For one page per operation,
 * compose `<OpenAPI.Operation>` yourself.
 */
export function OpenAPIDocs({ showSidebar = true, showSchemas = true, className }: OpenAPIDocsProps) {
  const { api } = useOpenAPI()
  const schemaNames = Object.keys(api.schemas)

  return (
    <div
      data-slot="openapi-docs"
      className={cn(showSidebar && "lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10", className)}
    >
      {showSidebar ? (
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--aria-header-height,0px)+1.5rem)] max-h-[calc(100dvh-var(--aria-header-height,0px)-3rem)] overflow-y-auto">
            <OpenAPISidebar />
          </div>
        </aside>
      ) : null}

      <div className="min-w-0 space-y-16">
        <OpenAPIInfo />

        {api.tags.map((tag) => (
          <section key={tag.id} id={tag.id} className="scroll-mt-24 space-y-12">
            <header className="space-y-2 border-b pb-4">
              <h2 className="text-foreground text-(length:--aria-text-xl) font-semibold tracking-tight">
                <AnchorLink id={tag.id}>{tag.title}</AnchorLink>
              </h2>
              <Markdown>{tag.description}</Markdown>
            </header>
            {tag.operations.map((operation) => (
              <OpenAPIOperation key={operation.id} operation={operation} headingLevel={3} />
            ))}
          </section>
        ))}

        {showSchemas && schemaNames.length > 0 ? (
          <section id="schemas" className="scroll-mt-24 space-y-6">
            <h2 className="text-foreground border-b pb-4 text-(length:--aria-text-xl) font-semibold tracking-tight">Schemas</h2>
            {schemaNames.map((name) => (
              <OpenAPISchema key={name} schema={api.schemas[name]} name={name} className="rounded-xl border p-4">
                <SchemaTitle className="mb-2" />
                <OpenAPISchema />
              </OpenAPISchema>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  )
}
