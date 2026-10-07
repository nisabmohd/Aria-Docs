import type { APIServer } from "./api.js"
import type { APISecurityRequirement } from "./security.js"
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
  /** Sanitized URL. */
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
  /** Always `true` for path parameters. */
  required: boolean
  deprecated: boolean
  allowEmptyValue?: boolean
  allowReserved?: boolean
  /** Serialization style, defaulted per location (`form` for query/cookie, `simple` for path/header). */
  style: string
  /** Defaults to `true` for `form` style, `false` otherwise. */
  explode: boolean
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
  /** Status as written in the document: `"200"`, `"4XX"` or `"default"`. */
  status: string
  /** Numeric status code for exact codes like `"200"`; `undefined` for ranges and `default`. */
  statusCode?: number
  description?: string
  headers: APIHeader[]
  content: APIContent[]
  links: APILink[]
  isSuccess: boolean
  isError: boolean
  isRedirect: boolean
  isDefault: boolean
  /** True for range keys such as `"2XX"`. */
  isRange: boolean
}

export interface APICallback {
  name: string
  expression: string
  description?: string
  operations: APIOperation[]
}

export interface APIOperation {
  /**
   * Unique, URL-safe id: the `operationId` (unsafe characters replaced) or one
   * generated from method + path. Duplicates get a `-2`, `-3` suffix.
   */
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
  /** Effective servers: operation → path item → document servers. */
  servers: APIServer[]
  deprecated: boolean
  callbacks: APICallback[]
  externalDocs?: ExternalDocs
  /** The original operation object, when parsed with `includeRaw: true`. */
  raw?: unknown
}
