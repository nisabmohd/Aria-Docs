import { isRecord, optionalString, sanitizeUrl, setOwn } from "@ariadocs/core"
import type {
  APIKeyLocation,
  APISecurityRequirement,
  APISecurityScheme,
  SecuritySchemeType,
} from "../types/index.js"

const SCHEME_TYPES = new Set<SecuritySchemeType>([
  "apiKey",
  "http",
  "mutualTLS",
  "oauth2",
  "openIdConnect",
])
const KEY_LOCATIONS = new Set<APIKeyLocation>(["query", "header", "cookie"])
const FLOW_KEYS = ["implicit", "password", "clientCredentials", "authorizationCode"] as const

export function normalizeSecuritySchemes(input: unknown): Record<string, APISecurityScheme> {
  const output: Record<string, APISecurityScheme> = {}
  if (!isRecord(input)) return output

  for (const [name, value] of Object.entries(input)) {
    if (!isRecord(value)) continue
    if (!SCHEME_TYPES.has(value.type as SecuritySchemeType)) continue

    const scheme: APISecurityScheme = {
      type: value.type as SecuritySchemeType,
      description: optionalString(value.description),
      name: optionalString(value.name),
      in: KEY_LOCATIONS.has(value.in as APIKeyLocation) ? (value.in as APIKeyLocation) : undefined,
      scheme: optionalString(value.scheme)?.toLowerCase(),
      bearerFormat: optionalString(value.bearerFormat),
      openIdConnectUrl: sanitizeUrl(value.openIdConnectUrl),
    }

    if (isRecord(value.flows)) {
      scheme.flows = normalizeFlows(value.flows)
    }

    setOwn(output, name, scheme)
  }

  return output
}

function normalizeFlows(input: Record<string, unknown>): APISecurityScheme["flows"] {
  const flows: NonNullable<APISecurityScheme["flows"]> = {}

  for (const key of FLOW_KEYS) {
    const flow = input[key]
    if (!isRecord(flow)) continue

    const scopes: Record<string, string> = {}
    if (isRecord(flow.scopes)) {
      for (const [scope, description] of Object.entries(flow.scopes)) {
        setOwn(scopes, scope, typeof description === "string" ? description : "")
      }
    }

    flows[key] = {
      authorizationUrl: sanitizeUrl(flow.authorizationUrl),
      tokenUrl: sanitizeUrl(flow.tokenUrl),
      refreshUrl: sanitizeUrl(flow.refreshUrl),
      scopes,
    }
  }

  return flows
}

/**
 * `security: [{ ApiKey: [] }, {}]` → `[{ schemes: [{ name: "ApiKey", scopes: [] }] }, { schemes: [] }]`.
 * An empty requirement (`{}`) means authentication is optional.
 */
export function normalizeSecurityRequirements(input: unknown): APISecurityRequirement[] {
  if (!Array.isArray(input)) return []

  return input
    .filter((requirement): requirement is Record<string, unknown> => isRecord(requirement))
    .map((requirement) => ({
      schemes: Object.entries(requirement).map(([name, scopes]) => ({
        name,
        scopes: Array.isArray(scopes)
          ? scopes.filter((scope): scope is string => typeof scope === "string")
          : [],
      })),
    }))
}
