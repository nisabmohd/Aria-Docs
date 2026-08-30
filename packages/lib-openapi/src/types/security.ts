export type SecuritySchemeType =
  | "apiKey"
  | "http"
  | "mutualTLS"
  | "oauth2"
  | "openIdConnect"

export type APIKeyLocation = "query" | "header" | "cookie"

export interface APIOAuthFlow {
  authorizationUrl?: string
  tokenUrl?: string
  refreshUrl?: string
  scopes: Record<string, string>
}

export interface APISecurityScheme {
  type: SecuritySchemeType
  description?: string
  /** apiKey: the name of the header/query/cookie parameter. */
  name?: string
  /** apiKey: where the key is sent. */
  in?: APIKeyLocation
  /** http: e.g. "basic", "bearer", "digest". */
  scheme?: string
  /** http: e.g. "JWT". */
  bearerFormat?: string
  /** oauth2. */
  flows?: {
    implicit?: APIOAuthFlow
    password?: APIOAuthFlow
    clientCredentials?: APIOAuthFlow
    authorizationCode?: APIOAuthFlow
  }
  /** openIdConnect. */
  openIdConnectUrl?: string
}

/**
 * A resolved security requirement: which schemes are required and with what
 * OAuth scopes. OpenAPI's `security: [{ apiKeyAuth: [] }]` becomes
 * `{ schemes: [{ name: "apiKeyAuth", scopes: [] }] }`.
 */
export interface APISecurityRequirement {
  schemes: {
    name: string
    scopes: string[]
  }[]
}
