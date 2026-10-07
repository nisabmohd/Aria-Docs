import type { JsonObject } from "@ariadocs/core"
import type { APIOperation, ExternalDocs } from "./operation.js"
import type { APISecurityRequirement, APISecurityScheme } from "./security.js"
import type { APISchema } from "./schema.js"

/** Any raw OpenAPI document (unvalidated JSON/YAML payload). */
export type OpenAPIDocument = Record<string, unknown>

export interface APIInfo {
  title: string
  version: string
  /** Short summary (OpenAPI 3.1). */
  summary?: string
  /** CommonMark description. Render it with a sanitizing Markdown renderer. */
  description?: string
  /** Sanitized: unsafe schemes such as `javascript:` are dropped. */
  termsOfService?: string
  contact?: {
    name?: string
    /** Sanitized URL. */
    url?: string
    email?: string
  }
  license?: {
    name?: string
    identifier?: string
    /** Sanitized URL. */
    url?: string
  }
}

export interface APIServerVariable {
  name: string
  description?: string
  default?: string
  enum?: string[]
}

export interface APIServer {
  /** URL template as written, e.g. `https://{region}.example.com/v1`. */
  url: string
  description?: string
  variables: Record<string, APIServerVariable>
}

export interface APITag {
  /** URL/anchor-safe, unique id. */
  id: string
  /** The tag name as used by operations. */
  name: string
  /** Display title (`x-displayName`, falling back to `name`). */
  title: string
  description?: string
  operations: APIOperation[]
  externalDocs?: ExternalDocs
}

export interface APIWebhook {
  id: string
  name: string
  description?: string
  operations: APIOperation[]
}

/**
 * The normalized API model returned by `parseOpenAPI()`.
 *
 * It keeps OpenAPI's vocabulary (`operations`, `schemas`,
 * `securitySchemes`), flattens it for UIs (`operations` instead of walking
 * `paths`) and precomputes helpers (status flags, tag grouping, unique ids).
 */
export interface APISpec {
  type: "openapi"
  /** The OpenAPI version from the document, e.g. `"3.1.0"`. */
  version: string
  info: APIInfo
  /** Document servers. Defaults to `[{ url: "/" }]` as the specification says. */
  servers: APIServer[]
  /** Operations grouped by tag, in declared tag order. Untagged operations go to a `default` tag. */
  tags: APITag[]
  /** Path → operations on that path. */
  paths: Record<string, APIOperation[]>
  /** Every operation, flattened across paths and methods. */
  operations: APIOperation[]
  schemas: Record<string, APISchema>
  securitySchemes: Record<string, APISecurityScheme>
  webhooks: APIWebhook[]
  /** Document-level security requirements. */
  security: APISecurityRequirement[]
  externalDocs?: ExternalDocs
  /** Non-fatal problems found while parsing, e.g. unresolved references. */
  warnings: string[]
  /** The raw document, when parsed with `includeRaw: true`. */
  raw?: JsonObject
}

export type APISearchResultType = "operation" | "schema" | "tag"

export interface APISearchResult {
  type: APISearchResultType
  /** Operation id, schema name or tag id. */
  id: string
  title: string
  subtitle?: string
}
