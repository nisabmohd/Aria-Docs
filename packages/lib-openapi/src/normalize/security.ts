import type { APISecurityRequirement, APISecurityScheme } from "../types/index.js"
import { isRecord, optionalString } from "./servers.js"

export function normalizeSecuritySchemes(
  input: unknown
): Record<string, APISecurityScheme> {
  const output: Record<string, APISecurityScheme> = {}

  if (!isRecord(input)) return output

  for (const [name, value] of Object.entries(input)) {
    if (!isRecord(value)) continue

    const scheme: APISecurityScheme = {
      type: (typeof value.type === "string" ? value.type : "http") as APISecurityScheme["type"],
      description: optionalString(value.description),
      name: optionalString(value.name),
      in: optionalString(value.in) as APISecurityScheme["in"],
      scheme: optionalString(value.scheme),
      bearerFormat: optionalString(value.bearerFormat),
      openIdConnectUrl: optionalString(value.openIdConnectUrl),
    }

    if (isRecord(value.flows)) {
      scheme.flows = normalizeFlows(value.flows)
    }

    output[name] = scheme
  }

  return output
}

function normalizeFlows(input: Record<string, unknown>): APISecurityScheme["flows"] {
  const flows: NonNullable<APISecurityScheme["flows"]> = {}

  const flowKeys = ["implicit", "password", "clientCredentials", "authorizationCode"] as const
  for (const key of flowKeys) {
    const flow = input[key]
    if (!isRecord(flow)) continue

    const scopes: Record<string, string> = {}
    if (isRecord(flow.scopes)) {
      for (const [scope, description] of Object.entries(flow.scopes)) {
        scopes[scope] = typeof description === "string" ? description : ""
      }
    }

    flows[key] = {
      authorizationUrl: optionalString(flow.authorizationUrl),
      tokenUrl: optionalString(flow.tokenUrl),
      refreshUrl: optionalString(flow.refreshUrl),
      scopes,
    }
  }

  return flows
}

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
