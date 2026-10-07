"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Minus, Plus } from "lucide-react"
import type { APIResponse } from "@ariadocs/openapi"
import { cn } from "../lib/utils.js"
import { Markdown } from "../markdown.js"
import { ResponseProvider, useOptionalOperation, useOptionalResponse, useResponse } from "./context.js"
import { ContentSchemas } from "./request-body.js"
import { FieldHeader } from "./schema.js"
import { AnchorLink, anchorId } from "./anchor.js"
import { Section } from "./section.js"

export interface OpenAPIResponseProps {
  response?: APIResponse
  children?: ReactNode
  className?: string
}

/** `<OpenAPI.Response>` — one response: description, headers and body schema. */
export function OpenAPIResponse({ response: responseProp, children, className }: OpenAPIResponseProps) {
  const inherited = useOptionalResponse()
  const response = responseProp ?? inherited
  if (response === null || response === undefined) return null

  return (
    <ResponseProvider value={response}>
      <div data-slot="openapi-response" className={cn("space-y-3", className)}>
        {children ?? (
          <>
            <ResponseDescription />
            <ResponseHeaders />
            <ResponseContent />
          </>
        )}
      </div>
    </ResponseProvider>
  )
}

/** Status code with a colored dot (green 2xx, blue 3xx, amber 4xx, red 5xx). */
export function StatusCode({ response, className }: { response: APIResponse; className?: string }) {
  const family = response.isDefault ? "default" : response.status[0]
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono", className)}>
      <span
        aria-hidden
        className="size-1.5 rounded-full"
        style={{ backgroundColor: `var(--aria-status-${family === "1" ? "default" : family}, var(--muted-foreground))` }}
      />
      {response.status}
    </span>
  )
}

export function ResponseStatus({ className }: { className?: string }) {
  return <StatusCode response={useResponse()} className={className} />
}

export function ResponseDescription({ className }: { className?: string }) {
  return <Markdown className={className}>{useResponse().description}</Markdown>
}

export function ResponseHeaders({ className }: { className?: string }) {
  const { headers, status } = useResponse()
  const operation = useOptionalOperation()
  if (headers.length === 0) return null
  return (
    <div className={className}>
      <p className="text-foreground mb-1 text-(length:--aria-text-sm) font-medium">Headers</p>
      <div className="divide-border divide-y">
        {headers.map((header) => (
          <div key={header.name} className="py-2">
            <FieldHeader
              id={anchorId(operation?.id, "response", status, "header", header.name)}
              name={header.name}
              schema={header.schema}
              required={header.required}
              deprecated={header.deprecated}
            />
            <Markdown className="mt-1">{header.description}</Markdown>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResponseContent({ className }: { className?: string }) {
  const { content } = useResponse()
  if (content.length === 0) return null
  return <ContentSchemas content={content} mode="response" className={className} />
}

/** `<OpenAPI.Operation.Responses>` — one row per status code; rows with headers or a body expand. */
export function OperationResponses({ responses, className }: { responses?: APIResponse[]; className?: string }) {
  const operation = useOptionalOperation()
  const list = responses ?? operation?.responses ?? []
  if (list.length === 0) return null

  return (
    <Section title="Responses" id={anchorId(operation?.id, "responses")} className={className}>
      <div className="divide-border divide-y">
        {list.map((response) => (
          <ResponseRow key={response.status} response={response} id={anchorId(operation?.id, "response", response.status)} />
        ))}
      </div>
    </Section>
  )
}

function ResponseRow({ response, id }: { response: APIResponse; id: string }) {
  const [open, setOpen] = useState(false)

  // Opened by a link: show the body right away.
  useEffect(() => {
    const openIfTargeted = () => {
      if (window.location.hash === `#${id}`) setOpen(true)
    }
    openIfTargeted()
    window.addEventListener("hashchange", openIfTargeted)
    return () => window.removeEventListener("hashchange", openIfTargeted)
  }, [id])
  const expandable = response.content.some((content) => content.schema !== undefined) || response.headers.length > 0
  const label = response.isDefault ? "default" : response.status

  return (
    <div id={id} className="scroll-mt-24 py-3 first:pt-1.5">
      <div className="flex items-baseline gap-4">
        <AnchorLink id={id} className="w-14 shrink-0">
          <span
            className="font-mono text-(length:--aria-text-sm)"
            style={{ color: `var(--aria-status-${response.isDefault ? "default" : response.status[0]}, var(--muted-foreground))` }}
          >
            {label}
          </span>
        </AnchorLink>
        <div className="min-w-0 flex-1">
          <Markdown className="text-foreground/85">{response.description ?? ""}</Markdown>
          {expandable ? (
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="text-muted-foreground hover:text-foreground mt-1.5 inline-flex items-center gap-1.5 text-(length:--aria-text-xs) transition-colors"
            >
              {open ? <Minus className="size-3" /> : <Plus className="size-3" />}
              {open ? "Hide" : "Show"} {response.content.length > 0 ? "response body" : "headers"}
            </button>
          ) : null}
        </div>
      </div>
      {open ? (
        <OpenAPIResponse response={response} className="border-border mt-3 ml-[4.5rem] border-l pl-4">
          <ResponseHeaders />
          <ResponseContent />
        </OpenAPIResponse>
      ) : null}
    </div>
  )
}
