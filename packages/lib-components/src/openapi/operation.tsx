"use client"

import type { ReactNode } from "react"
import { getOperationTitle, getServerUrl, type APIOperation } from "@ariadocs/openapi"
import { CopyButton } from "../code/code-block.js"
import { cn } from "../lib/utils.js"
import { Markdown } from "../markdown.js"
import { OperationProvider, useOperation, useOptionalOpenAPI } from "./context.js"
import { RequestExample, ResponseExample } from "./examples.js"
import { AnchorLink } from "./anchor.js"
import { MethodBadge } from "./method.js"
import { OperationParameters } from "./parameter.js"
import { OpenAPIRequestBody } from "./request-body.js"
import { OperationResponses } from "./response.js"
import { OpenAPISecurity } from "./security.js"

export interface OpenAPIOperationProps {
  /** The operation to render. Takes precedence over `id`. */
  operation?: APIOperation
  /** Look the operation up by id in `<OpenAPI.Root>`. */
  id?: string
  /** Heading level for the title (default `2`; use `1` on a page per operation). */
  headingLevel?: 1 | 2 | 3
  /** Compose your own layout from `OpenAPI.Operation.*` parts. */
  children?: ReactNode
  className?: string
}

/**
 * `<OpenAPI.Operation>` — one endpoint. Bare usage renders the full layout:
 * title, method + URL bar, description, then authorization, parameters,
 * body and responses beside request/response examples. Pass children to
 * compose your own from the parts.
 */
export function OpenAPIOperation({ operation: operationProp, id, headingLevel = 2, children, className }: OpenAPIOperationProps) {
  const root = useOptionalOpenAPI()
  const operation = operationProp ?? (id !== undefined ? root?.getOperation(id) : undefined)
  if (operation === undefined) return null

  return (
    <OperationProvider value={operation}>
      <section
        id={operation.id}
        data-slot="openapi-operation"
        data-method={operation.method.toLowerCase()}
        className={cn("scroll-mt-24", className)}
      >
        {children ?? (
          <>
            <OperationTag />
            <OperationTitle level={headingLevel} />
            <OperationHeader className="mt-4" />
            <OperationDescription className="mt-4" />
            <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
              <div className="min-w-0 space-y-10">
                <OpenAPISecurity />
                <OperationParameters />
                <OpenAPIRequestBody />
                <OperationResponses />
              </div>
              <div className="min-w-0 space-y-4 xl:sticky xl:top-[calc(var(--aria-header-height,0px)+1.5rem)] xl:self-start">
                <RequestExample />
                <ResponseExample />
              </div>
            </div>
          </>
        )}
      </section>
    </OperationProvider>
  )
}

/** The operation's first tag (its display title), shown above the title. */
export function OperationTag({ className }: { className?: string }) {
  const operation = useOperation()
  const root = useOptionalOpenAPI()
  const name = operation.tags[0]
  if (name === undefined) return null
  const tag = root?.api.tags.find((item) => item.name === name)
  return <p className={cn("text-muted-foreground mb-2 text-(length:--aria-text-sm)", className)}>{tag?.title ?? name}</p>
}

/** Title from `summary` (falls back to `METHOD /path`), with a deprecated marker. */
export function OperationTitle({ level = 2, className }: { level?: 1 | 2 | 3; className?: string }) {
  const operation = useOperation()
  const Heading = `h${level}` as const
  return (
    <Heading
      className={cn(
        "text-foreground font-semibold tracking-tight",
        level === 1 ? "text-(length:--aria-text-2xl) leading-tight" : level === 2 ? "text-(length:--aria-text-xl)" : "text-(length:--aria-text-xl)",
        operation.deprecated && "line-through decoration-2 opacity-70",
        className
      )}
    >
      <AnchorLink id={operation.id}>{getOperationTitle(operation)}</AnchorLink>
    </Heading>
  )
}

/** Method badge + full URL in a bar, with copy. */
export function OperationHeader({ className }: { className?: string }) {
  const operation = useOperation()
  const server = operation.servers[0]
  const base = server !== undefined && server.url !== "/" ? getServerUrl(server).replace(/\/+$/, "") : ""

  return (
    <div
      data-slot="openapi-operation-header"
      className={cn("bg-[var(--aria-code-background)] flex items-center gap-3 rounded-xl border py-1.5 pr-1.5 pl-3.5", className)}
    >
      <MethodBadge method={operation.method} variant="text" />
      <code className="min-w-0 flex-1 truncate font-mono text-(length:--aria-text-sm)">
        {base !== "" ? <span className="text-muted-foreground">{base}</span> : null}
        <OperationPathText path={operation.path} />
      </code>
      <OperationDeprecated />
      <CopyButton value={base + operation.path} />
    </div>
  )
}

function OperationPathText({ path }: { path: string }) {
  return (
    <>
      {path.split(/(\{[^{}]+\})/g).map((part, index) =>
        part.startsWith("{") ? (
          <span key={index} className="text-[var(--aria-accent)]">
            {part}
          </span>
        ) : (
          <span key={index} className="text-foreground">
            {part}
          </span>
        )
      )}
    </>
  )
}

/**
 * The HTTP method badge. Use inside `<OpenAPI.Operation>`.
 *
 * ```tsx
 * <OpenAPI.Operation.Method />
 * ```
 */
export function OperationMethod({ className }: { className?: string }) {
  return <MethodBadge method={useOperation().method} className={className} />
}

/**
 * The path template, e.g. `/pets/{id}`, in monospace.
 *
 * ```tsx
 * <OpenAPI.Operation.Path />
 * ```
 */
export function OperationPath({ className }: { className?: string }) {
  return (
    <code className={cn("font-mono text-(length:--aria-text-sm) break-all", className)}>
      <OperationPathText path={useOperation().path} />
    </code>
  )
}

/**
 * A "Deprecated" marker. Renders nothing for operations that aren't deprecated.
 *
 * ```tsx
 * <OpenAPI.Operation.Deprecated />
 * ```
 */
export function OperationDeprecated({ className }: { className?: string }) {
  if (!useOperation().deprecated) return null
  return (
    <span className={cn("bg-muted text-muted-foreground rounded-md border px-1.5 py-0.5 text-(length:--aria-text-xs) font-medium", className)}>
      Deprecated
    </span>
  )
}

/**
 * The operation `summary` as plain text. Renders nothing when it is missing.
 *
 * ```tsx
 * <OpenAPI.Operation.Summary />
 * ```
 */
export function OperationSummary({ className }: { className?: string }) {
  const { summary } = useOperation()
  if (summary === undefined) return null
  return <p className={cn("text-foreground font-medium", className)}>{summary}</p>
}

/**
 * The operation `description`, rendered as Markdown.
 *
 * ```tsx
 * <OpenAPI.Operation.Description />
 * ```
 */
export function OperationDescription({ className }: { className?: string }) {
  return <Markdown className={cn("max-w-2xl text-(length:--aria-text-base)", className)}>{useOperation().description}</Markdown>
}

/** Request and response examples side by side (stacked on small screens). */
export function OperationExamples({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <RequestExample />
      <ResponseExample />
    </div>
  )
}
