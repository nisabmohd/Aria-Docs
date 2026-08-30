import type { APIOperation, APIParameter, APIRequestBody, APIResponse, APICallback, ExternalDocs, HTTPMethod } from "./operation.js"
import type { APISecurityRequirement, APISecurityScheme } from "./security.js"
import type { APISchema } from "./schema.js"

/** Any raw OpenAPI document (unvalidated JSON/YAML payload). */
export type OpenAPIDocument = Record<string, unknown>

export interface APIInfo {
  title: string
  version: string
  description?: string
  termsOfService?: string
  contact?: {
    name?: string
    url?: string
    email?: string
  }
  license?: {
    name?: string
    identifier?: string
    url?: string
  }
}

export interface APIServerVariable {
  name?: string
  description?: string
  default?: string
  enum?: string[]
}

export interface APIServer {
  url: string
  description?: string
  variables: Record<string, APIServerVariable>
}

export interface APITag {
  name: string
  description?: string
  operations: APIOperation[]
  externalDocs?: ExternalDocs
}

/** Operations grouped by tag — directly drives sidebar navigation. */
export interface APIOperationGroup {
  id: string
  name: string
  description?: string
  operations: APIOperation[]
}

export interface APIWebhook {
  id: string
  name: string
  description?: string
  operations: APIOperation[]
  servers: { url: string; description?: string }[]
}

/**
 * The normalized Ariadocs API model — the single output of `openapi.parse()`.
 *
 * OpenAPI vocabulary is kept (`operations`, `schemas`, `securitySchemes`),
 * flattened for convenience (`operations` instead of walking `paths`), and
 * enriched with computed helpers (status flags, grouped navigation).
 */
export interface AriadocsOpenAPI {
  type: "openapi"
  /** The OpenAPI version string from the document, e.g. "3.1.0". */
  version: string
  info: APIInfo
  servers: APIServer[]
  tags: APITag[]
  /** Path → operations on that path (OpenAPI vocabulary, kept for lookups). */
  paths: Record<string, APIOperation[]>
  /** Every operation flattened across paths and methods — the primary list for UIs. */
  operations: APIOperation[]
  groups: APIOperationGroup[]
  schemas: Record<string, APISchema>
  securitySchemes: Record<string, APISecurityScheme>
  webhooks: APIWebhook[]
  security: APISecurityRequirement[]
  externalDocs?: ExternalDocs
  /** The raw (pre-normalization) document, when parsed with `includeRaw: true`. */
  raw?: OpenAPIDocument
}

export interface APINavigationItem {
  id: string
  title: string
  method?: HTTPMethod
  path?: string
}

export interface APINavigationGroup {
  id: string
  title: string
  items: APINavigationItem[]
}

export interface APINavigation {
  groups: APINavigationGroup[]
}

export type APISearchResultType = "operation" | "schema" | "tag"

export interface APISearchResult {
  type: APISearchResultType
  id: string
  title: string
  subtitle?: string
}

export type { APIOperation, APIParameter, APIRequestBody, APIResponse, APICallback, ExternalDocs, HTTPMethod }
export type { APISecurityRequirement, APISecurityScheme }
export type { APISchema }
