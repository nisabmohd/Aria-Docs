import { isRecord, optionalString, sanitizeUrl } from "@ariadocs/core"
import type {
  APIContent,
  APIExample,
  APIHeader,
  APILink,
  APIParameter,
  APIResponse,
  ExternalDocs,
  HTTPMethod,
  ParameterLocation,
} from "../types/index.js"
import { asJson, asJsonObject } from "./json.js"
import { normalizeSchema } from "./schema.js"
import { normalizeServers } from "./servers.js"

export const HTTP_METHODS: Lowercase<HTTPMethod>[] = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
]

export function isHttpMethod(value: string): value is Lowercase<HTTPMethod> {
  return (HTTP_METHODS as string[]).includes(value)
}

const PARAMETER_LOCATIONS = new Set<ParameterLocation>(["path", "query", "header", "cookie"])

export function normalizeExamples(input: unknown): APIExample[] {
  if (!isRecord(input)) return []
  return Object.entries(input)
    .filter(([, value]) => isRecord(value))
    .map(([name, value]) => {
      const record = value as Record<string, unknown>
      return {
        name,
        summary: optionalString(record.summary),
        description: optionalString(record.description),
        value: asJson(record.value),
        externalValue: sanitizeUrl(record.externalValue),
      }
    })
}

export function normalizeContent(input: unknown): APIContent[] {
  if (!isRecord(input)) return []
  return Object.entries(input).map(([mediaType, value]) => {
    const record = isRecord(value) ? value : {}
    return {
      mediaType,
      schema: record.schema !== undefined ? normalizeSchema(record.schema) : undefined,
      example: asJson(record.example),
      examples: normalizeExamples(record.examples),
      encoding: isRecord(record.encoding) ? asJsonObject(record.encoding) : undefined,
    }
  })
}

/**
 * Normalize one parameter. Returns `undefined` for entries that cannot be
 * used: missing `name`, an unknown `in`, or an unresolved `$ref`.
 */
export function normalizeParameter(input: unknown): APIParameter | undefined {
  if (!isRecord(input)) return undefined
  if (typeof input.name !== "string" || input.name === "") return undefined
  if (!PARAMETER_LOCATIONS.has(input.in as ParameterLocation)) return undefined

  const location = input.in as ParameterLocation
  const style =
    optionalString(input.style) ?? (location === "query" || location === "cookie" ? "form" : "simple")

  return {
    name: input.name,
    in: location,
    description: optionalString(input.description),
    // Path parameters are always required (OpenAPI 3.x §4.8.12.1).
    required: location === "path" ? true : input.required === true,
    deprecated: input.deprecated === true,
    allowEmptyValue: input.allowEmptyValue === true ? true : undefined,
    allowReserved: input.allowReserved === true ? true : undefined,
    style,
    explode: typeof input.explode === "boolean" ? input.explode : style === "form",
    schema: input.schema !== undefined ? normalizeSchema(input.schema) : undefined,
    content: input.content !== undefined ? normalizeContent(input.content) : undefined,
    examples: normalizeExamples(input.examples),
    example: asJson(input.example),
  }
}

/**
 * Merge path-level and operation-level parameters. Identity is
 * `(in, name)`; operation-level entries override path-level ones. Header
 * names are case-insensitive.
 */
export function mergeParameters(pathLevel: unknown, operationLevel: unknown): APIParameter[] {
  const merged = new Map<string, APIParameter>()

  for (const input of [...toArray(pathLevel), ...toArray(operationLevel)]) {
    const parameter = normalizeParameter(input)
    if (parameter === undefined) continue
    const name = parameter.in === "header" ? parameter.name.toLowerCase() : parameter.name
    merged.set(`${parameter.in}:${name}`, parameter)
  }

  return [...merged.values()]
}

export function groupParametersByLocation(
  parameters: APIParameter[]
): Record<ParameterLocation, APIParameter[]> {
  const groups: Record<ParameterLocation, APIParameter[]> = {
    path: [],
    query: [],
    header: [],
    cookie: [],
  }
  for (const parameter of parameters) {
    groups[parameter.in].push(parameter)
  }
  return groups
}

export function normalizeHeaders(input: unknown): APIHeader[] {
  if (!isRecord(input)) return []
  return (
    Object.entries(input)
      // `Content-Type` response headers are ignored by the specification.
      .filter(([name, value]) => isRecord(value) && name.toLowerCase() !== "content-type")
      .map(([name, value]) => {
        const record = value as Record<string, unknown>
        return {
          name,
          description: optionalString(record.description),
          required: record.required === true,
          deprecated: record.deprecated === true,
          schema: record.schema !== undefined ? normalizeSchema(record.schema) : undefined,
        }
      })
  )
}

export function normalizeLinks(input: unknown): APILink[] {
  if (!isRecord(input)) return []
  return Object.entries(input)
    .filter(([, value]) => isRecord(value))
    .map(([name, value]) => {
      const record = value as Record<string, unknown>
      return {
        name,
        operationId: optionalString(record.operationId),
        operationRef: optionalString(record.operationRef),
        description: optionalString(record.description),
        parameters: isRecord(record.parameters) ? asJsonObject(record.parameters) : undefined,
        requestBody: asJson(record.requestBody),
        server: normalizeServers([record.server])?.[0],
      }
    })
}

const STATUS_PATTERN = /^[1-5](\d\d|XX)$/i

export function normalizeResponses(input: unknown): APIResponse[] {
  if (!isRecord(input)) return []

  const responses: APIResponse[] = []
  for (const [status, value] of Object.entries(input)) {
    const isDefault = status === "default"
    if (!isDefault && !STATUS_PATTERN.test(status)) continue

    const record = isRecord(value) ? value : {}
    const isRange = !isDefault && /XX$/i.test(status)
    const statusCode = isDefault || isRange ? undefined : Number(status)
    const family = isDefault ? 0 : Number(status[0])

    responses.push({
      status: isRange ? status.toUpperCase() : status,
      statusCode,
      description: optionalString(record.description),
      headers: normalizeHeaders(record.headers),
      content: normalizeContent(record.content),
      links: normalizeLinks(record.links),
      isSuccess: family === 2,
      isRedirect: family === 3,
      isError: family === 4 || family === 5,
      isDefault,
      isRange,
    })
  }

  return responses.sort((a, b) => statusOrder(a) - statusOrder(b))
}

/** Exact codes first within their family (200 < 2XX < 300), `default` last. */
function statusOrder(response: APIResponse): number {
  if (response.isDefault) return Number.MAX_SAFE_INTEGER
  if (response.isRange) return Number(response.status[0]) * 100 + 99.5
  return response.statusCode ?? 0
}

export function normalizeExternalDocs(input: unknown): ExternalDocs | undefined {
  if (!isRecord(input)) return undefined
  const url = sanitizeUrl(input.url)
  if (url === undefined) return undefined
  return { url, description: optionalString(input.description) }
}

function toArray(input: unknown): unknown[] {
  return Array.isArray(input) ? input : []
}
