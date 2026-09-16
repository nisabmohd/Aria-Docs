"use client"

import type { ReactNode } from "react"
import {
  getSchemaProperties,
  getSchemaType,
  type APISchema,
  type APISchemaProperty,
} from "@ariadocs/openapi"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Badge } from "../ui/badge.js"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible.js"
import { cn } from "../lib/utils.js"
import { SchemaProvider, useOptionalSchemaContext, useSchemaContext } from "./context.js"

export interface OpenAPISchemaProps {
  schema?: APISchema
  name?: string
  children?: ReactNode
  /** Render a compact inline variant (for parameter cells and nested properties). */
  compact?: boolean
  className?: string
}

/**
 * `<OpenAPI.Schema>` — renders a schema as a recursive property tree.
 * Object properties expand into nested (collapsible) schemas; references
 * render as their resolved name.
 */
export function OpenAPISchema({
  schema: schemaProp,
  name,
  children,
  compact = false,
  className,
}: OpenAPISchemaProps) {
  const contextSchema = useOptionalSchemaContext()?.schema
  const schema = schemaProp ?? contextSchema

  if (schema === undefined) {
    return null
  }

  return (
    <SchemaProvider schema={schema} name={name}>
      <div
        data-slot="openapi-schema"
        className={cn(compact ? "text-xs" : "rounded-lg border", compact ? "" : "p-3", className)}
      >
        {children ?? <DefaultSchema name={name} />}
      </div>
    </SchemaProvider>
  )
}

function DefaultSchema({ name }: { name?: string }) {
  const { schema } = useSchemaContext()
  const properties = getSchemaProperties(schema)

  return (
    <div className="space-y-2">
      <SchemaTitle name={name} />
      <SchemaDescription />
      {properties.length > 0 ? (
        <SchemaProperties />
      ) : (
        <SchemaTypeBadge schema={schema} />
      )}
    </div>
  )
}

export function SchemaTitle({ name, className }: { name?: string; className?: string }) {
  const context = useSchemaContext()
  const title = name ?? context.name ?? context.schema.title

  if (title === undefined) {
    return null
  }

  return (
    <div className={cn("text-foreground font-mono text-xs font-semibold", className)}>
      {title}
    </div>
  )
}

export function SchemaDescription({ className }: { className?: string }) {
  const { schema } = useSchemaContext()

  if (schema.description === undefined) {
    return null
  }

  return (
    <p className={cn("text-muted-foreground text-xs leading-relaxed", className)}>
      {schema.description}
    </p>
  )
}

export function SchemaProperties({ className }: { className?: string }) {
  const { schema } = useSchemaContext()
  const properties = getSchemaProperties(schema)

  if (properties.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-0", className)}>
      {properties.map((property) => (
        <SchemaPropertyRow key={property.name} property={property} />
      ))}
    </div>
  )
}

function SchemaTypeBadge({ schema }: { schema: APISchema }) {
  const type = getSchemaType(schema) ?? "any"

  return (
    <Badge variant="secondary" className="h-5 font-mono text-[10px]">
      {type}
    </Badge>
  )
}

function SchemaPropertyRow({ property }: { property: APISchemaProperty }) {
  const childType = getSchemaType(property.schema)
  const rawRef = property.schema["$ref"]
  const isNestedObject =
    childType === "object" &&
    property.schema.properties !== undefined &&
    Object.keys(property.schema.properties).length > 0
  const isUnresolvedRef = rawRef !== undefined
  const expandable = isNestedObject && !isUnresolvedRef

  if (!expandable) {
    return (
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 border-b py-1 last:border-b-0">
        <div className="flex items-center gap-1.5">
          <PropertyName name={property.name} required={property.required} />
          <PropertyType schema={property.schema} />
        </div>
        <div className="text-muted-foreground self-center text-xs leading-relaxed">
          {isUnresolvedRef && rawRef !== undefined ? refName(rawRef) : property.description ?? ""}
          {property.deprecated ? <PropertyDeprecated /> : null}
        </div>
      </div>
    )
  }

  return (
    <Collapsible className="group/property border-b py-1 last:border-b-0">
      <CollapsibleTrigger className="flex w-full items-center gap-1.5 text-left">
        <ChevronRight className="text-muted-foreground group-data-[state=open]/property:hidden size-3.5 shrink-0" />
        <ChevronDown className="text-muted-foreground group-data-[state=closed]/property:hidden size-3.5 shrink-0" />
        <PropertyName name={property.name} required={property.required} />
        <PropertyType schema={property.schema} />
        <span className="text-muted-foreground truncate text-xs">
          {property.description ?? ""}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-l ml-1.5 pl-3">
          <OpenAPISchema schema={property.schema} compact />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function refName(ref: string): string {
  const name = ref.split("/").pop()
  return `$ref: ${name ?? ref}`
}

export function PropertyName({
  name,
  required,
  className,
}: {
  name: string
  required?: boolean
  className?: string
}) {
  return (
    <code className={cn("text-foreground font-mono text-xs font-medium", className)}>
      {name}
      {required ? <span className="text-destructive ml-0.5">*</span> : null}
    </code>
  )
}

export function PropertyType({ schema, className }: { schema: APISchema; className?: string }) {
  const type = getSchemaType(schema)

  if (type === undefined) {
    return null
  }

  return (
    <span className={cn("text-muted-foreground/80 font-mono text-[10px]", className)}>
      {type}
      {schema.format !== undefined ? ` (${schema.format})` : ""}
    </span>
  )
}

export function PropertyRequired({ className }: { className?: string }) {
  const { schema } = useSchemaContext()

  if (schema.nullable) {
    return <span className={cn("text-muted-foreground/60 text-[10px]", className)}>nullable</span>
  }

  return null
}

export function PropertyDefault({ className }: { className?: string }) {
  const { schema } = useSchemaContext()

  if (schema.default === undefined) {
    return null
  }

  return (
    <code className={cn("bg-muted rounded px-1 font-mono text-[10px]", className)}>
      default: {JSON.stringify(schema.default)}
    </code>
  )
}

export function PropertyDeprecated() {
  return (
    <Badge variant="destructive" className="ml-1.5 h-4 px-1.5 text-[9px]">
      deprecated
    </Badge>
  )
}
