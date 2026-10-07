"use client"

import { useState, type ReactNode } from "react"
import type { APIContent, APIRequestBody } from "@ariadocs/openapi"
import { cn } from "../lib/utils.js"
import { Markdown } from "../markdown.js"
import { useOptionalOperation } from "./context.js"
import { OpenAPISchema, type SchemaMode } from "./schema.js"
import { anchorId } from "./anchor.js"
import { Section } from "./section.js"

export interface OpenAPIRequestBodyProps {
  /** Defaults to the current operation's request body. */
  requestBody?: APIRequestBody
  children?: ReactNode
  className?: string
}

/** `<OpenAPI.RequestBody>` — the body schema, with a media type switch when there are several. */
export function OpenAPIRequestBody({ requestBody: bodyProp, children, className }: OpenAPIRequestBodyProps) {
  const operation = useOptionalOperation()
  const requestBody = bodyProp ?? operation?.requestBody
  if (requestBody === undefined) return null

  return (
    <Section
      title="Body"
      id={anchorId(operation?.id, "body")}
      className={className}
      aside={
        <>
          {requestBody.content.length === 1 ? (
            <span className="text-muted-foreground font-mono text-(length:--aria-text-xs)">{requestBody.content[0]?.mediaType}</span>
          ) : null}
          {requestBody.required ? null : <span className="text-muted-foreground text-(length:--aria-text-xs)">optional</span>}
        </>
      }
    >
      {children ?? (
        <>
          <RequestBodyDescription requestBody={requestBody} />
          <RequestBodyContent requestBody={requestBody} />
        </>
      )}
    </Section>
  )
}

/**
 * The request body `description`, rendered as Markdown.
 *
 * ```tsx
 * <OpenAPI.RequestBody.Description />
 * ```
 */
export function RequestBodyDescription({ requestBody, className }: { requestBody?: APIRequestBody; className?: string }) {
  const operation = useOptionalOperation()
  const body = requestBody ?? operation?.requestBody
  return <Markdown className={cn("mb-2", className)}>{body?.description}</Markdown>
}

/**
 * The body schema per media type, with a switch when there are several.
 *
 * ```tsx
 * <OpenAPI.RequestBody.Content />
 * ```
 */
export function RequestBodyContent({ requestBody, className }: { requestBody?: APIRequestBody; className?: string }) {
  const operation = useOptionalOperation()
  const body = requestBody ?? operation?.requestBody
  if (body === undefined || body.content.length === 0) return null
  return <ContentSchemas content={body.content} preferred={body.preferredContentType} mode="request" className={className} />
}

/** Schema per media type, with a selector when there is more than one. */
export function ContentSchemas({
  content,
  preferred,
  mode,
  className,
}: {
  content: APIContent[]
  preferred?: string
  mode?: SchemaMode
  className?: string
}) {
  const [selected, setSelected] = useState(preferred ?? content[0]?.mediaType)
  const current = content.find((item) => item.mediaType === selected) ?? content[0]
  if (current === undefined) return null

  return (
    <div className={className}>
      <div className={cn("mb-1 flex items-center gap-2", content.length === 1 && "hidden")}>
        {content.length > 1 ? (
          <select
            aria-label="Content type"
            value={current.mediaType}
            onChange={(event) => setSelected(event.target.value)}
            className="bg-background text-muted-foreground rounded-md border px-2 py-1 font-mono text-(length:--aria-text-xs)"
          >
            {content.map((item) => (
              <option key={item.mediaType} value={item.mediaType}>
                {item.mediaType}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-muted-foreground font-mono text-(length:--aria-text-xs)">{current.mediaType}</span>
        )}
      </div>
      {current.schema !== undefined ? <OpenAPISchema schema={current.schema} mode={mode} /> : null}
    </div>
  )
}
