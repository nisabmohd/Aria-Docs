"use client"

import type { ReactNode } from "react"
import type { APIResponse } from "@ariadocs/openapi"
import { Badge } from "../ui/badge.js"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.js"
import { cn } from "../lib/utils.js"
import { ResponseProvider, useOptionalResponseContext, useResponseContext } from "./context.js"
import { ContentDetail } from "./request-body.js"

export interface OpenAPIResponseProps {
  response?: APIResponse
  children?: ReactNode
  className?: string
}

/**
 * `<OpenAPI.Response>` — renders one response (status badge, description,
 * headers, content schema + example). Pass children to compose your own.
 */
export function OpenAPIResponse({
  response: responseProp,
  children,
  className,
}: OpenAPIResponseProps) {
  const contextResponse = useOptionalResponseContext()?.response
  const response = responseProp ?? contextResponse

  if (response === undefined) {
    return null
  }

  return (
    <ResponseProvider response={response}>
      <div
        data-slot="openapi-response"
        className={cn("space-y-2 rounded-lg border p-3", className)}
      >
        {children ?? <DefaultResponse />}
      </div>
    </ResponseProvider>
  )
}

function DefaultResponse() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <ResponseStatus />
        <ResponseDescription />
      </div>
      <ResponseHeaders />
      <ResponseContent />
    </>
  )
}

export function ResponseStatus({ className }: { className?: string }) {
  const { response } = useResponseContext()

  const variant = response.isSuccess
    ? "outline"
    : response.isError
      ? "destructive"
      : "secondary"

  return (
    <Badge variant={variant} className={cn("font-mono text-xs font-bold", className)}>
      {response.status}
    </Badge>
  )
}

export function ResponseDescription({ className }: { className?: string }) {
  const { response } = useResponseContext()

  if (response.description === undefined) {
    return null
  }

  return (
    <span className={cn("text-muted-foreground text-sm", className)}>
      {response.description}
    </span>
  )
}

export function ResponseHeaders({ className }: { className?: string }) {
  const { response } = useResponseContext()

  if (response.headers.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        Headers
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-7 w-1/3">Name</TableHead>
            <TableHead className="h-7">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {response.headers.map((header) => (
            <TableRow key={header.name}>
              <TableCell className="py-1.5 font-mono text-xs font-medium">
                {header.name}
              </TableCell>
              <TableCell className="text-muted-foreground py-1.5 text-xs">
                {header.description ?? ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function ResponseContent({ className }: { className?: string }) {
  const { response } = useResponseContext()

  if (response.content.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-3", className)}>
      {response.content.map((content) => (
        <ContentDetail
          key={content.mediaType}
          mediaType={content.mediaType}
          schema={content.schema}
          example={content.example}
        />
      ))}
    </div>
  )
}
