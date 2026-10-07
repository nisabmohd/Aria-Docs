"use client"

import { useState, type ReactNode } from "react"
import { isRecord } from "@ariadocs/core"
import {
  getSchemaName,
  getSchemaProperties,
  getSchemaTypeLabel,
  type APISchema,
  type APISchemaProperty,
} from "@ariadocs/openapi"
import { Minus, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.js"
import { cn } from "../lib/utils.js"
import { Markdown } from "../markdown.js"
import { AnchorLink } from "./anchor.js"
import { SchemaProvider, useOptionalOpenAPI, useOptionalSchema, useSchema } from "./context.js"

/** `request` hides `readOnly` properties, `response` hides `writeOnly` ones. */
export type SchemaMode = "request" | "response"

const MAX_DEPTH = 12

export interface OpenAPISchemaProps {
  schema?: APISchema
  /** Display name, e.g. the component schema key. */
  name?: string
  mode?: SchemaMode
  /** Compose your own layout from `OpenAPI.Schema.*` parts. */
  children?: ReactNode
  className?: string
}

/**
 * `<OpenAPI.Schema>` — a schema as a field list: name, type, required flag,
 * description and constraints, with nested objects, arrays and
 * `oneOf`/`anyOf` variants expandable. Recursive schemas stop at the
 * repeated reference.
 */
export function OpenAPISchema({ schema: schemaProp, name, mode, children, className }: OpenAPISchemaProps) {
  const inherited = useOptionalSchema()
  const root = useOptionalOpenAPI()
  // `<OpenAPI.Schema name="Email" />` inside Root looks the schema up by name.
  const schema = schemaProp ?? (name !== undefined ? root?.getSchema(name) : undefined) ?? inherited?.schema
  if (schema === undefined) return null

  return (
    <SchemaProvider value={{ schema, name: name ?? (schemaProp === undefined ? inherited?.name : undefined) }}>
      <div data-slot="openapi-schema" className={cn("text-(length:--aria-text-sm)", className)}>
        {children ?? (
          <>
            <SchemaDescription />
            <SchemaProperties mode={mode} />
          </>
        )}
      </div>
    </SchemaProvider>
  )
}

/**
 * The schema name as a heading. Use inside `<OpenAPI.Schema>`.
 *
 * ```tsx
 * <OpenAPI.Schema.Title id="schema-pet" />
 * ```
 */
export function SchemaTitle({ id, className }: { /** Anchor id; the title links to it. */ id?: string; className?: string }) {
  const { schema, name } = useSchema()
  const title = name ?? schema.title ?? getSchemaName(schema.ref)
  if (title === undefined) return null
  return (
    <div id={id} className={cn("flex scroll-mt-24 items-baseline gap-2", className)}>
      <AnchorLink id={id}>
        <span className="text-foreground font-mono font-semibold">{title}</span>
      </AnchorLink>
      <span className="text-muted-foreground font-mono text-(length:--aria-text-xs)">{getSchemaTypeLabel(schema)}</span>
    </div>
  )
}

/**
 * The schema `description`, rendered as Markdown.
 *
 * ```tsx
 * <OpenAPI.Schema.Description />
 * ```
 */
export function SchemaDescription({ className }: { className?: string }) {
  const { schema } = useSchema()
  return <Markdown className={cn("mb-2", className)}>{schema.description}</Markdown>
}

/** The schema's fields, or its type and constraints when it has none. */
export function SchemaProperties({ mode, className }: { mode?: SchemaMode; className?: string }) {
  const { schema } = useSchema()
  return (
    <div className={className}>
      <SchemaBody schema={schema} mode={mode} depth={0} seen={[]} />
    </div>
  )
}

/** Fields of an object (or of an array's items), variants of oneOf/anyOf, else a type summary. */
function SchemaBody({
  schema,
  mode,
  depth,
  seen,
}: {
  schema: APISchema
  mode?: SchemaMode
  depth: number
  seen: string[]
}) {
  const properties = visibleProperties(schema, mode)
  if (properties.length > 0) {
    return (
      <div data-slot="openapi-fields" className="divide-border divide-y">
        {properties.map((property) => (
          <SchemaField key={property.name} property={property} mode={mode} depth={depth} seen={seen} />
        ))}
      </div>
    )
  }

  const items = arrayItems(schema)
  if (items !== undefined && hasChildren(items, mode)) {
    return <SchemaBody schema={items} mode={mode} depth={depth} seen={nextSeen(seen, schema)} />
  }

  const variants = schemaVariants(schema)
  if (variants !== undefined) {
    return <SchemaVariants variants={variants} mode={mode} depth={depth} seen={nextSeen(seen, schema)} />
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="text-muted-foreground font-mono text-(length:--aria-text-xs)">{getSchemaTypeLabel(schema)}</span>
      <Constraints schema={schema} />
    </div>
  )
}

function SchemaField({
  property,
  mode,
  depth,
  seen,
}: {
  property: APISchemaProperty
  mode?: SchemaMode
  depth: number
  seen: string[]
}) {
  const [open, setOpen] = useState(false)
  const { schema } = property
  const recursive = isRecursive(schema, seen)
  const expandable = !recursive && depth < MAX_DEPTH && hasChildren(schema, mode)

  return (
    <div data-slot="openapi-field" className="py-3 first:pt-1 last:pb-1">
      <FieldHeader
        name={property.name}
        schema={schema}
        required={property.required}
        deprecated={property.deprecated}
        readOnly={property.readOnly}
        writeOnly={property.writeOnly}
      />
      <Markdown className="mt-1">{property.description}</Markdown>
      <Constraints schema={schema} className="mt-1.5" />
      {recursive ? (
        <p className="text-muted-foreground mt-1.5 text-(length:--aria-text-xs)">↻ Recursive reference to {recursiveName(schema)}</p>
      ) : null}
      {expandable ? (
        <div className="mt-2">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-(length:--aria-text-xs) transition-colors"
          >
            {open ? <Minus className="size-3" /> : <Plus className="size-3" />}
            {childLabel(schema, mode)}
          </button>
          {open ? (
            <div className="border-border mt-2 border-l pl-4">
              <SchemaBody schema={schema} mode={mode} depth={depth + 1} seen={nextSeen(seen, schema)} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export interface FieldHeaderProps {
  name: string
  /** Anchor id: the row gets this id and its name links to `#id`. */
  id?: string
  schema?: APISchema
  /** Overrides the computed type label. */
  type?: string
  required?: boolean
  deprecated?: boolean
  readOnly?: boolean
  writeOnly?: boolean
}

/** `name  type  required` row shared by schema fields, parameters and headers. */
export function FieldHeader({ name, id, schema, type, required, deprecated, readOnly, writeOnly }: FieldHeaderProps) {
  return (
    <div id={id} className="flex scroll-mt-24 flex-wrap items-baseline gap-x-2 gap-y-1">
      <AnchorLink id={id}>
        <code className={cn("text-foreground font-mono text-(length:--aria-text-code) font-semibold", deprecated && "line-through opacity-70")}>
          {name}
        </code>
      </AnchorLink>
      <span className="text-muted-foreground font-mono text-(length:--aria-text-xs)">
        {type ?? (schema !== undefined ? getSchemaTypeLabel(schema) : "any")}
      </span>
      {required ? <span className="text-[var(--aria-required)] text-(length:--aria-text-xs)">required</span> : null}
      {deprecated ? <Chip>deprecated</Chip> : null}
      {readOnly ? <Chip>read-only</Chip> : null}
      {writeOnly ? <Chip>write-only</Chip> : null}
    </div>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="bg-muted text-muted-foreground rounded px-1.5 py-px text-(length:--aria-text-xs) font-medium tracking-wide uppercase">
      {children}
    </span>
  )
}

/** Default, enum, range, length, pattern and format details. */
export function Constraints({ schema, className }: { schema: APISchema; className?: string }) {
  const items: ReactNode[] = []
  const value = (v: unknown) => (
    <code className="bg-muted text-foreground rounded px-1 font-mono text-(length:--aria-text-xs)">{formatValue(v)}</code>
  )

  if (schema.default !== undefined) items.push(<>Default: {value(schema.default)}</>)
  if (schema.const !== undefined) items.push(<>Value: {value(schema.const)}</>)
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    items.push(
      <>
        One of:{" "}
        {schema.enum.slice(0, 20).map((option, i) => (
          <span key={i} className="mr-1 inline-block">
            {value(option)}
          </span>
        ))}
        {schema.enum.length > 20 ? `+${schema.enum.length - 20} more` : null}
      </>
    )
  }

  const range = rangeLabel(schema)
  if (range !== undefined) items.push(range)
  if (schema.minLength !== undefined || schema.maxLength !== undefined) {
    items.push(lengthLabel("length", schema.minLength, schema.maxLength))
  }
  if (schema.minItems !== undefined || schema.maxItems !== undefined) {
    items.push(lengthLabel("items", schema.minItems, schema.maxItems))
  }
  if (schema.uniqueItems === true) items.push("Unique items")
  if (schema.pattern !== undefined) items.push(<>Pattern: {value(schema.pattern)}</>)
  if (schema.multipleOf !== undefined) items.push(`Multiple of ${schema.multipleOf}`)

  if (items.length === 0) return null
  return (
    <div className={cn("text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-(length:--aria-text-xs)", className)}>
      {items.map((item, i) => (
        <span key={i}>{item}</span>
      ))}
    </div>
  )
}

function SchemaVariants({
  variants,
  mode,
  depth,
  seen,
}: {
  variants: { kind: string; options: APISchema[] }
  mode?: SchemaMode
  depth: number
  seen: string[]
}) {
  const options = variants.options.filter((option): option is APISchema => isRecord(option)).slice(0, 20)
  if (options.length === 0) return null

  return (
    <div className="py-2">
      <p className="text-muted-foreground mb-2 text-(length:--aria-text-xs)">{variants.kind === "oneOf" ? "One of" : "Any of"}</p>
      <Tabs defaultValue="0" className="gap-3">
        <TabsList className="h-auto flex-wrap">
          {options.map((option, i) => (
            <TabsTrigger key={i} value={String(i)} className="text-(length:--aria-text-xs)">
              {option.title ?? getSchemaName(option.ref ?? option.$ref) ?? getSchemaTypeLabel(option)}
            </TabsTrigger>
          ))}
        </TabsList>
        {options.map((option, i) => (
          <TabsContent key={i} value={String(i)} className="rounded-lg border px-3">
            <Markdown className="pt-2">{option.description}</Markdown>
            {isRecursive(option, seen) ? (
              <p className="text-muted-foreground py-2 text-(length:--aria-text-xs)">↻ Recursive reference to {recursiveName(option)}</p>
            ) : (
              <SchemaBody schema={option} mode={mode} depth={depth + 1} seen={nextSeen(seen, option)} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function visibleProperties(schema: APISchema, mode?: SchemaMode): APISchemaProperty[] {
  return getSchemaProperties(schema).filter(
    (property) => !(mode === "request" && property.readOnly) && !(mode === "response" && property.writeOnly)
  )
}

function childLabel(schema: APISchema, mode?: SchemaMode): string {
  const count =
    visibleProperties(schema, mode).length ||
    (arrayItems(schema) !== undefined ? visibleProperties(arrayItems(schema) as APISchema, mode).length : 0)
  if (count > 0) return `${count} child ${count === 1 ? "property" : "properties"}`
  const variants = schemaVariants(schema)
  return variants !== undefined ? `${variants.options.length} variants` : "Show details"
}

function arrayItems(schema: APISchema): APISchema | undefined {
  const items = Array.isArray(schema.items) ? schema.items[0] : schema.items
  return isRecord(items) ? items : undefined
}

function schemaVariants(schema: APISchema): { kind: string; options: APISchema[] } | undefined {
  const nonNull = (options: APISchema[]) => options.filter((option) => !(isRecord(option) && option.type === "null"))
  if (Array.isArray(schema.oneOf) && nonNull(schema.oneOf).length > 1) return { kind: "oneOf", options: nonNull(schema.oneOf) }
  if (Array.isArray(schema.anyOf) && nonNull(schema.anyOf).length > 1) return { kind: "anyOf", options: nonNull(schema.anyOf) }
  const single = [schema.oneOf, schema.anyOf].map((v) => (Array.isArray(v) ? nonNull(v) : [])).find((v) => v.length === 1)
  return single !== undefined ? { kind: "oneOf", options: single } : undefined
}

function hasChildren(schema: APISchema, mode?: SchemaMode): boolean {
  if (typeof schema.$ref === "string") return false
  if (visibleProperties(schema, mode).length > 0) return true
  const items = arrayItems(schema)
  if (items !== undefined) return hasChildren(items, mode)
  // Variants are only worth expanding when one of them has fields (`string | string[]` doesn't).
  const variants = schemaVariants(schema)
  return variants !== undefined && variants.options.some((option) => isRecord(option) && hasChildren(option, mode))
}

function isRecursive(schema: APISchema, seen: string[]): boolean {
  if (typeof schema.$ref === "string") return true
  return typeof schema.ref === "string" && seen.includes(schema.ref)
}

function recursiveName(schema: APISchema): string {
  return getSchemaName(schema.$ref ?? schema.ref) ?? "parent schema"
}

function nextSeen(seen: string[], schema: APISchema): string[] {
  return typeof schema.ref === "string" ? [...seen, schema.ref] : seen
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value)
  const text = JSON.stringify(value)
  return text === undefined ? String(value) : text.length > 80 ? `${text.slice(0, 79)}…` : text
}

function rangeLabel(schema: APISchema): string | undefined {
  const lower =
    typeof schema.exclusiveMinimum === "number"
      ? `> ${schema.exclusiveMinimum}`
      : schema.minimum !== undefined
        ? `${schema.exclusiveMinimum === true ? ">" : ">="} ${schema.minimum}`
        : undefined
  const upper =
    typeof schema.exclusiveMaximum === "number"
      ? `< ${schema.exclusiveMaximum}`
      : schema.maximum !== undefined
        ? `${schema.exclusiveMaximum === true ? "<" : "<="} ${schema.maximum}`
        : undefined
  if (lower === undefined && upper === undefined) return undefined
  return `Range: ${[lower, upper].filter(Boolean).join(", ")}`
}

function lengthLabel(what: string, min?: number, max?: number): string {
  if (min !== undefined && max !== undefined) return `${min} to ${max} ${what}`
  if (min !== undefined) return `≥ ${min} ${what}`
  return `≤ ${max} ${what}`
}
