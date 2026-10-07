"use client"

import type { ReactNode } from "react"
import type { APIParameter, ParameterLocation } from "@ariadocs/openapi"
import { cn } from "../lib/utils.js"
import { Markdown } from "../markdown.js"
import { ParameterProvider, useOptionalOperation, useOptionalParameter, useParameter } from "./context.js"
import { Constraints, FieldHeader, OpenAPISchema } from "./schema.js"
import { anchorId } from "./anchor.js"
import { Section } from "./section.js"

export interface OpenAPIParameterProps {
  parameter?: APIParameter
  /** Compose your own layout from `OpenAPI.Parameter.*` parts. */
  children?: ReactNode
  className?: string
}

/** `<OpenAPI.Parameter>` — one parameter as a field row. */
export function OpenAPIParameter({ parameter: parameterProp, children, className }: OpenAPIParameterProps) {
  const inherited = useOptionalParameter()
  const parameter = parameterProp ?? inherited
  if (parameter === null || parameter === undefined) return null

  return (
    <ParameterProvider value={parameter}>
      <div data-slot="openapi-parameter" className={cn("py-3 first:pt-1 last:pb-1", className)}>
        {children ?? (
          <>
            <ParameterHeader />
            <ParameterDescription className="mt-1" />
            <ParameterDetails className="mt-1.5" />
          </>
        )}
      </div>
    </ParameterProvider>
  )
}

/**
 * The `name  type  required` row. Use inside `<OpenAPI.Parameter>`.
 *
 * ```tsx
 * <OpenAPI.Parameter.Header />
 * ```
 */
export function ParameterHeader() {
  const parameter = useParameter()
  const operation = useOptionalOperation()
  const schema = parameter.schema ?? parameter.content?.[0]?.schema
  return (
    <FieldHeader
      id={anchorId(operation?.id, parameter.in, parameter.name)}
      name={parameter.name}
      schema={schema}
      required={parameter.required}
      deprecated={parameter.deprecated}
    />
  )
}

/**
 * The parameter name in monospace.
 *
 * ```tsx
 * <OpenAPI.Parameter.Name />
 * ```
 */
export function ParameterName({ className }: { className?: string }) {
  return <code className={cn("text-foreground font-mono text-(length:--aria-text-code) font-semibold", className)}>{useParameter().name}</code>
}

/**
 * Where the parameter goes: `path`, `query`, `header` or `cookie`.
 *
 * ```tsx
 * <OpenAPI.Parameter.In />
 * ```
 */
export function ParameterIn({ className }: { className?: string }) {
  return <span className={cn("text-muted-foreground text-(length:--aria-text-xs)", className)}>{useParameter().in}</span>
}

/**
 * A "required" label. Renders nothing for optional parameters.
 *
 * ```tsx
 * <OpenAPI.Parameter.Required />
 * ```
 */
export function ParameterRequired({ className }: { className?: string }) {
  const { required } = useParameter()
  return (
    <span className={cn("text-(length:--aria-text-xs) font-medium", required ? "text-[var(--aria-required)]" : "text-muted-foreground", className)}>
      {required ? "required" : "optional"}
    </span>
  )
}

/**
 * The parameter `description`, rendered as Markdown.
 *
 * ```tsx
 * <OpenAPI.Parameter.Description />
 * ```
 */
export function ParameterDescription({ className }: { className?: string }) {
  return <Markdown className={className}>{useParameter().description}</Markdown>
}

/** Constraints plus the example, if any. */
export function ParameterDetails({ className }: { className?: string }) {
  const parameter = useParameter()
  const example = parameter.example ?? parameter.examples[0]?.value
  return (
    <div className={cn("space-y-1", className)}>
      {parameter.schema !== undefined ? <Constraints schema={parameter.schema} /> : null}
      {example !== undefined ? (
        <p className="text-muted-foreground text-(length:--aria-text-xs)">
          Example:{" "}
          <code className="bg-muted text-foreground rounded px-1 font-mono text-(length:--aria-text-xs)">
            {typeof example === "string" ? example : JSON.stringify(example)}
          </code>
        </p>
      ) : null}
    </div>
  )
}

/** The parameter's full schema tree (for object/array parameters). */
export function ParameterSchema({ className }: { className?: string }) {
  const parameter = useParameter()
  const schema = parameter.schema ?? parameter.content?.[0]?.schema
  if (schema === undefined) return null
  return <OpenAPISchema schema={schema} className={className} />
}

/**
 * The parameter example as a code value. Renders nothing without one.
 *
 * ```tsx
 * <OpenAPI.Parameter.Example />
 * ```
 */
export function ParameterExample({ className }: { className?: string }) {
  const parameter = useParameter()
  const example = parameter.example ?? parameter.examples[0]?.value
  if (example === undefined) return null
  return (
    <code className={cn("bg-muted rounded px-1 py-0.5 font-mono text-(length:--aria-text-xs)", className)}>
      {typeof example === "string" ? example : JSON.stringify(example)}
    </code>
  )
}

const LOCATION_TITLES: Record<ParameterLocation, string> = {
  path: "Path Parameters",
  query: "Query Parameters",
  header: "Header Parameters",
  cookie: "Cookie Parameters",
}

/** `<OpenAPI.Operation.Parameters>` — one section per location. */
export function OperationParameters({
  parameters,
  className,
}: {
  /** Defaults to the current operation's parameters. */
  parameters?: APIParameter[]
  className?: string
}) {
  const operation = useOptionalOperation()
  const list = parameters ?? operation?.parameters ?? []
  if (list.length === 0) return null

  return (
    <div data-slot="openapi-parameters" className={cn("space-y-8", className)}>
      {(["path", "query", "header", "cookie"] as const).map((location) => {
        const group = list.filter((parameter) => parameter.in === location)
        if (group.length === 0) return null
        return (
          <Section key={location} title={LOCATION_TITLES[location]} id={anchorId(operation?.id, LOCATION_TITLES[location])}>
            <div className="divide-border divide-y">
              {group.map((parameter) => (
                <OpenAPIParameter key={`${parameter.in}:${parameter.name}`} parameter={parameter} />
              ))}
            </div>
          </Section>
        )
      })}
    </div>
  )
}
