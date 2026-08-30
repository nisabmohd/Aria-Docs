import type { APISecurityRequirement, APISecurityScheme } from "./security.js"
import type { APISchema } from "./schema.js"

export type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "TRACE"

export type ParameterLocation = "path" | "query" | "header" | "cookie"

export interface ExternalDocs {
  url: string
  description?: string
}

export interface APIExample {
  name: string
  summary?: string
  description?: string
  value?: unknown
  externalValue?: string
}

/** A media type payload, e.g. `{ mediaType: "application/json", schema, example }`. */
export interface APIContent {
  mediaType: string
  schema?: APISchema
  example?: unknown
  examples: APIExample[]
  encoding?: Record<string, unknown>
}

export interface APIParameter {
  name: string
  /** Where the parameter is sent: path, query, header or cookie (OpenAPI's `in`). */
  in: ParameterLocation
  description?: string
  required: boolean
  deprecated: boolean
  allowEmptyValue?: boolean
  allowReserved?: boolean
  style?: string
  explode?: boolean
  schema?: APISchema
  content?: APIContent[]
  examples: APIExample[]
  example?: unknown
}

export interface APIRequestBody {
  description?: string
  required: boolean
  content: APIContent[]
  /** The media type a UI should select by default (first JSON content, or first content). */
  preferredContentType?: string
}

export interface APIHeader {
  name: string
  description?: string
  required: boolean
  deprecated: boolean
  schema?: APISchema
}

export interface APILink {
  name: string
  operationId?: string
  operationRef?: string
  description?: string
  parameters?: Record<string, unknown>
  requestBody?: unknown
  server?: { url: string; description?: string }
}

export interface APIResponse {
  /** Status as written in the document: "200", "404" or "default". */
  status: string
  /** Numeric status code, when the key parses as a number. */
  statusCode?: number
  description?: string
  headers: APIHeader[]
  content: APIContent[]
  links: APILink[]
  isSuccess: boolean
  isError: boolean
  isRedirect: boolean
  isDefault: boolean
}

export interface APICallback {
  name: string
  expression: string
  description?: string
  operations: APIOperation[]
}

export interface APIOperation {
  /** Stable id: `operationId` when present, otherwise generated from method + path. */
  id: string
  /** The `operationId` exactly as written in the document, when present. */
  operationId?: string
  method: HTTPMethod
  path: string
  summary?: string
  description?: string
  tags: string[]
  /** Path-level and operation-level parameters merged (operation wins on name + in collisions). */
  parameters: APIParameter[]
  /** The same parameters bucketed by location, so UIs never filter manually. */
  parametersByLocation: Record<ParameterLocation, APIParameter[]>
  requestBody?: APIRequestBody
  responses: APIResponse[]
  security: APISecurityRequirement[]
  servers: { url: string; description?: string }[]
  deprecated: boolean
  callbacks: APICallback[]
  externalDocs?: ExternalDocs
  /** The original operation object, when parsed with `includeRaw: true`. */
  raw?: unknown
}
