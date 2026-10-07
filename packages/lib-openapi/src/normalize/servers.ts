import { isRecord, optionalString, optionalStringArray, setOwn } from "@ariadocs/core"
import type { APIServer, APIServerVariable } from "../types/index.js"

/**
 * Normalize a `servers` array. Returns `undefined` when the input is missing
 * or has no usable entries, so callers can fall back to the outer level.
 */
export function normalizeServers(input: unknown): APIServer[] | undefined {
  if (!Array.isArray(input)) return undefined

  const servers = input
    .filter((item): item is Record<string, unknown> => isRecord(item) && typeof item.url === "string")
    .map((item) => {
      const variables: Record<string, APIServerVariable> = {}
      if (isRecord(item.variables)) {
        for (const [name, variable] of Object.entries(item.variables)) {
          if (!isRecord(variable)) continue
          setOwn(variables, name, {
            name,
            description: optionalString(variable.description),
            default: scalarString(variable.default),
            enum: optionalStringArray(
              Array.isArray(variable.enum) ? variable.enum.map(scalarString) : undefined
            ),
          })
        }
      }

      return {
        url: item.url as string,
        description: optionalString(item.description),
        variables,
      }
    })

  return servers.length > 0 ? servers : undefined
}

/** The specification's default when no servers are declared. */
export const DEFAULT_SERVERS: APIServer[] = [{ url: "/", variables: {} }]

function scalarString(value: unknown): string | undefined {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return undefined
}
