"use client"

import { cn } from "../lib/utils.js"

export interface OpenAPICodeProps {
  code: string
  language?: string
  title?: string
  className?: string
}

/**
 * `<OpenAPI.Code>` — a code block with a language label.
 */
export function OpenAPICode({ code, language, title, className }: OpenAPICodeProps) {
  return (
    <div
      data-slot="openapi-code"
      className={cn(
        "bg-[var(--aria-code-background,var(--muted))] overflow-hidden rounded-lg border",
        className
      )}
    >
      <div className="text-muted-foreground flex items-center justify-between border-b px-3 py-1.5">
        <span className="font-mono text-[10px] tracking-wide uppercase">
          {title ?? language ?? "code"}
        </span>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  )
}

export interface OpenAPIExampleProps {
  /** The example value; rendered as pretty-printed JSON. */
  example?: unknown
  title?: string
  className?: string
}

/**
 * `<OpenAPI.Example>` — renders a value as a JSON example block.
 */
export function OpenAPIExample({ example, title, className }: OpenAPIExampleProps) {
  if (example === undefined) {
    return null
  }

  const code = typeof example === "string" ? example : JSON.stringify(example, null, 2)

  return (
    <OpenAPICode code={code} language="json" title={title ?? "Example"} className={className} />
  )
}
