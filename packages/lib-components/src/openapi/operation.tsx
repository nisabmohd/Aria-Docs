"use client"

import type { ReactNode } from "react"
import type { APIOperation, HTTPMethod } from "@ariadocs/openapi"
import { Badge } from "../ui/badge.js"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.js"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.js"
import { cn } from "../lib/utils.js"
import { OperationProvider, useOperationContext, useOpenAPIContext } from "./context.js"
import { OpenAPIParameter } from "./parameter.js"
import { OpenAPIRequestBody } from "./request-body.js"
import { OpenAPIResponse } from "./response.js"
import { OpenAPISecurity } from "./security.js"
export interface OpenAPIOperationProps {
  /** The operation to render. Takes precedence over `id`. */
  operation?: APIOperation
  /** Look up an operation by id from the `<OpenAPI.Root>` context. */
  id?: string
  /** Replace the default composition entirely. */
  children?: ReactNode
  className?: string
}

/**
 * `<OpenAPI.Operation>` — renders one API operation. Bare usage gives the
 * working default (header, summary, parameters, request body, responses);
 * pass children to compose your own layout from the compound parts.
 */
export function OpenAPIOperation({
  operation: operationProp,
  id,
  children,
  className,
}: OpenAPIOperationProps) {
  const root = useOpenAPIContext()
  const operation = operationProp ?? (id !== undefined ? root.getOperation(id) : undefined)

  if (operation === undefined) {
    return null
  }

  return (
    <OperationProvider operation={operation}>
      <section
        id={operation.id}
        data-slot="openapi-operation"
        className={cn("scroll-mt-24 space-y-4", className)}
      >
      {children ?? <DefaultOperation />}
      </section>
    </OperationProvider>
  )
}

function DefaultOperation() {
  return (
    <>
      <OperationHeader />
      <OperationSummary />
      <OperationDescription />
      <OperationParameters />
      <OperationRequestBody />
      <OperationResponses />
      <OpenAPISecurity />
    </>
  )
}

// ---------------------------------------------------------------------------
// Compound parts
// ---------------------------------------------------------------------------

export function OperationHeader({ className }: { className?: string }) {
  return (
    <div
      data-slot="openapi-operation-header"
      className={cn("flex flex-wrap items-center gap-3", className)}
    >
      <OperationMethod />
      <OperationPath />
      <OperationDeprecated />
    </div>
  )
}

export function OperationMethod({ className }: { className?: string }) {
  const { operation } = useOperationContext()

  return (
    <Badge
      variant="outline"
      data-slot="openapi-method"
      className={cn("font-mono text-xs font-bold", className)}
      style={{ color: `var(--aria-method-${operation.method.toLowerCase()})` }}
    >
      {operation.method}
    </Badge>
  )
}

export function OperationPath({ className }: { className?: string }) {
  const { operation } = useOperationContext()

  return (
    <code
      data-slot="openapi-path"
      className={cn(
        "bg-muted text-foreground rounded-md px-2 py-1 font-mono text-sm font-medium break-all",
        className
      )}
    >
      {operation.path}
    </code>
  )
}

export function OperationDeprecated({ className }: { className?: string }) {
  const { operation } = useOperationContext()

  if (!operation.deprecated) {
    return null
  }

  return (
    <Badge variant="destructive" data-slot="openapi-deprecated" className={className}>
      Deprecated
    </Badge>
  )
}

export function OperationSummary({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  const { operation } = useOperationContext()

  return (
    <h3
      data-slot="openapi-operation-summary"
      className={cn("text-foreground text-lg font-semibold", className)}
    >
      {children ?? operation.summary}
    </h3>
  )
}

export function OperationDescription({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  const { operation } = useOperationContext()
  if (children === undefined && operation.description === undefined) {
    return null
  }

  return (
    <p
      data-slot="openapi-operation-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
    >
      {children ?? operation.description}
    </p>
  )
}

const LOCATION_LABELS: Record<string, string> = {
  path: "Path Parameters",
  query: "Query Parameters",
  header: "Header Parameters",
  cookie: "Cookie Parameters",
}

export function OperationParameters({ className }: { className?: string }) {
  const { operation } = useOperationContext()

  const locations = (["path", "query", "header", "cookie"] as const).filter(
    (location) => (operation.parametersByLocation[location] ?? []).length > 0
  )

  if (locations.length === 0 && operation.parameters.length === 0) {
    return null
  }

  return (
    <Card data-slot="openapi-parameters" className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        {locations.map((location) => (
          <div key={location} className="space-y-2">
            <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {LOCATION_LABELS[location]}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Name</TableHead>
                  <TableHead className="w-1/6">Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(operation.parametersByLocation[location] ?? []).map((parameter) => (
                  <TableRow key={`${parameter.in}-${parameter.name}`}>
                    <TableCell className="font-mono text-xs font-medium">
                      {parameter.name}
                      {parameter.required ? (
                        <span className="text-destructive ml-0.5">*</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {parameter.schema?.type ?? "string"}
                    </TableCell>
                    <TableCell>
                      <OpenAPIParameter parameter={parameter} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function OperationRequestBody({ className }: { className?: string }) {
  const { operation } = useOperationContext()

  if (operation.requestBody === undefined) {
    return null
  }

  return <OpenAPIRequestBody requestBody={operation.requestBody} className={className} />
}

export function OperationResponses({ className }: { className?: string }) {
  const { operation } = useOperationContext()

  if (operation.responses.length === 0) {
    return null
  }

  return (
    <Card data-slot="openapi-responses" className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Responses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        {operation.responses.map((response) => (
          <OpenAPIResponse key={response.status} response={response} />
        ))}
      </CardContent>
    </Card>
  )
}

export function OperationServers({ className }: { className?: string }) {
  const root = useOpenAPIContext()

  if (root.api.servers.length === 0) {
    return null
  }

  return (
    <div data-slot="openapi-operation-servers" className={cn("space-y-1", className)}>
      {root.api.servers.map((server) => (
        <div key={server.url} className="text-muted-foreground font-mono text-xs">
          {server.url}
          {server.description !== undefined ? ` — ${server.description}` : ""}
        </div>
      ))}
    </div>
  )
}

export type { HTTPMethod }
