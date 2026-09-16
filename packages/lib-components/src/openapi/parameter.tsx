"use client"

import type { ReactNode } from "react"
import type { APIParameter } from "@ariadocs/openapi"
import { Badge } from "../ui/badge.js"
import { cn } from "../lib/utils.js"
import {
  ParameterProvider,
  useOptionalParameterContext,
  useParameterContext,
} from "./context.js"
import { OpenAPISchema } from "./schema.js"

export interface OpenAPIParameterProps {
  parameter?: APIParameter
  children?: ReactNode
  className?: string
}

/**
 * `<OpenAPI.Parameter>` — renders one parameter (name, required flag,
 * description, schema, example). Pass children to compose your own layout.
 */
export function OpenAPIParameter({
  parameter: parameterProp,
  children,
  className,
}: OpenAPIParameterProps) {
  const contextParameter = useOptionalParameterContext()?.parameter
  const parameter = parameterProp ?? contextParameter

  if (parameter === undefined) {
    return null
  }

  return (
    <ParameterProvider parameter={parameter}>
      <div
        data-slot="openapi-parameter"
        className={cn("text-muted-foreground text-xs leading-relaxed", className)}
      >
        {children ?? <DefaultParameter />}
      </div>
    </ParameterProvider>
  )
}

function DefaultParameter() {
  return (
    <>
      <ParameterDescription />
      <ParameterSchema />
    </>
  )
}

export function ParameterName({ className }: { className?: string }) {
  const { parameter } = useParameterContext()
  return (
    <code className={cn("text-foreground font-mono text-xs font-medium", className)}>
      {parameter.name}
    </code>
  )
}

export function ParameterIn({ className }: { className?: string }) {
  const { parameter } = useParameterContext()
  return (
    <Badge variant="secondary" className={cn("h-4 px-1.5 text-[10px]", className)}>
      {parameter.in}
    </Badge>
  )
}

export function ParameterRequired({ className }: { className?: string }) {
  const { parameter } = useParameterContext()

  if (!parameter.required) {
    return <span className={cn("text-muted-foreground/70 text-[10px]", className)}>optional</span>
  }

  return (
    <Badge variant="destructive" className={cn("h-4 px-1.5 text-[10px]", className)}>
      required
    </Badge>
  )
}

export function ParameterDescription({ className }: { className?: string }) {
  const { parameter } = useParameterContext()

  if (parameter.description === undefined) {
    return null
  }

  return <span className={cn("block", className)}>{parameter.description}</span>
}

export function ParameterSchema({ className }: { className?: string }) {
  const { parameter } = useParameterContext()

  if (parameter.schema === undefined) {
    return null
  }

  return <OpenAPISchema schema={parameter.schema} className={className} compact />
}

export function ParameterExample({ className }: { className?: string }) {
  const { parameter } = useParameterContext()
  const example = parameter.example ?? parameter.examples[0]?.value

  if (example === undefined) {
    return null
  }

  return (
    <code className={cn("bg-muted rounded px-1 py-0.5 font-mono text-[11px]", className)}>
      {typeof example === "string" ? example : JSON.stringify(example)}
    </code>
  )
}
