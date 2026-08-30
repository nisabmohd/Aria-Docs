import type {
  APIServer,
  APIServerVariable,
} from "../types/index.js"

export function normalizeServers(
  input: unknown
): APIServer[] {
  if (!Array.isArray(input)) {
    // OpenAPI defaults to a single server: "/"
    return [{ url: "/", description: undefined, variables: {} }]
  }

  const servers = input
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => {
      const variables: Record<string, APIServerVariable> = {}
      const rawVariables = item.variables
      if (isRecord(rawVariables)) {
        for (const [name, variable] of Object.entries(rawVariables)) {
          if (!isRecord(variable)) continue
          variables[name] = {
            name,
            description: optionalString(variable.description),
            default: optionalString(variable.default),
            enum: optionalStringArray(variable.enum),
          }
        }
      }

      return {
        url: typeof item.url === "string" ? item.url : "/",
        description: optionalString(item.description),
        variables,
      }
    })

  return servers.length > 0 ? servers : [{ url: "/", description: undefined, variables: {} }]
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined
}

export function optionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const strings = value.filter((item): item is string => typeof item === "string")
  return strings.length > 0 ? strings : undefined
}

export function optionalBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback
}
