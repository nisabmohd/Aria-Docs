"use client"

import type { ReactNode } from "react"
import type { APIRequestBody } from "@ariadocs/openapi"
import { Badge } from "../ui/badge.js"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.js"
import { cn } from "../lib/utils.js"
import { useOptionalOperationContext } from "./context.js"
import { OpenAPICode } from "./code.js"
import { OpenAPISchema } from "./schema.js"
import { generateSchemaExample } from "@ariadocs/openapi"

export interface OpenAPIRequestBodyProps {
  requestBody?: APIRequestBody
  children?: ReactNode
  className?: string
}

/**
 * `<OpenAPI.RequestBody>` — renders the request body with a media type
 * selector, its schema and a generated example.
 */
export function OpenAPIRequestBody({
  requestBody: requestBodyProp,
  children,
  className,
}: OpenAPIRequestBodyProps) {
  const contextBody = useOptionalOperationContext()?.operation.requestBody
  const requestBody = requestBodyProp ?? contextBody

  if (requestBody === undefined) {
    return null
  }

  return (
    <Card data-slot="openapi-request-body" className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          Request Body
          {requestBody.required ? (
            <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
              required
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        {children ?? <DefaultRequestBody requestBody={requestBody} />}
      </CardContent>
    </Card>
  )
}

function DefaultRequestBody({ requestBody }: { requestBody: APIRequestBody }) {
  return (
    <>
      <RequestBodyDescription requestBody={requestBody} />
      <RequestBodyContent requestBody={requestBody} />
    </>
  )
}

export function RequestBodyDescription({
  requestBody,
  className,
}: {
  requestBody: APIRequestBody
  className?: string
}) {
  if (requestBody.description === undefined) {
    return null
  }

  return (
    <p className={cn("text-muted-foreground text-sm", className)}>
      {requestBody.description}
    </p>
  )
}

export function RequestBodyContent({
  requestBody,
  className,
}: {
  requestBody: APIRequestBody
  className?: string
}) {
  if (requestBody.content.length === 0) {
    return null
  }

  if (requestBody.content.length === 1) {
    const content = requestBody.content[0]
    if (content === undefined) {
      return null
    }
    return (
      <div className={cn("space-y-3", className)}>
        <ContentDetail mediaType={content.mediaType} schema={content.schema} example={content.example} />
      </div>
    )
  }

  return (
    <Tabs defaultValue={requestBody.preferredContentType} className={className}>
      <TabsList>
        {requestBody.content.map((content) => (
          <TabsTrigger key={content.mediaType} value={content.mediaType}>
            {content.mediaType}
          </TabsTrigger>
        ))}
      </TabsList>
      {requestBody.content.map((content) => (
        <TabsContent key={content.mediaType} value={content.mediaType}>
          <ContentDetail mediaType={content.mediaType} schema={content.schema} example={content.example} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

export interface ContentDetailProps {
  mediaType: string
  schema?: import("@ariadocs/openapi").APISchema
  example?: unknown
  className?: string
}

export function ContentDetail({ mediaType, schema, example, className }: ContentDetailProps) {
  const value = example ?? (schema !== undefined ? generateSchemaExample(schema) : undefined)

  return (
    <div className={cn("space-y-3", className)}>
      {schema !== undefined ? <OpenAPISchema schema={schema} compact /> : null}
      {value !== undefined ? <OpenAPICode code={JSON.stringify(value, null, 2)} language="json" /> : null}
      <div className="text-muted-foreground/70 text-[10px]">Content-Type: {mediaType}</div>
    </div>
  )
}
