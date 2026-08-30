import type {
  APIExample,
  APIHeader,
  APILink,
  APIParameter,
  APIResponse,
  APIContent,
  ExternalDocs,
  HTTPMethod,
  ParameterLocation,
} from "../types/index.js"
import { normalizeSchema } from "./schema.js"
import { isRecord, optionalString } from "./servers.js"

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

const PARAMETER_LOCATIONS: ParameterLocation[] = ["path", "query", "header", "cookie"]

export function normalizeExamples(input: unknown): APIExample[] {
  if (!isRecord(input)) return []
  return Object.entries(input).map(([name, value]) => {
    const record = isRecord(value) ? value : {}
    return {
      name,
      summary: optionalString(record.summary),
      description: optionalString(record.description),
      value: record.value,
      externalValue: optionalString(record.externalValue),
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
      example: record.example,
      examples: normalizeExamples(record.examples),
      encoding: isRecord(record.encoding) ? record.encoding : undefined,
    }
  })
}

export function normalizeParameter(input: unknown): APIParameter | undefined {
  if (!isRecord(input)) return undefined

  const location = typeof input.in === "string" && PARAMETER_LOCATIONS.includes(input.in as ParameterLocation)
    ? (input.in as ParameterLocation)
    : "query"

  return {
    name: typeof input.name === "string" ? input.name : "",
    in: location,
    description: optionalString(input.description),
    required: input.required === true,
    deprecated: input.deprecated === true,
    allowEmptyValue: input.allowEmptyValue === true ? true : undefined,
    allowReserved: input.allowReserved === true ? true : undefined,
    style: optionalString(input.style),
    explode: input.explode === true ? true : input.style === "form" ? true : undefined,
    schema: input.schema !== undefined ? normalizeSchema(input.schema) : undefined,
    content: input.content !== undefined ? normalizeContent(input.content) : undefined,
    examples: normalizeExamples(input.examples),
    example: input.example,
  }
}

/**
 * Merge path-level and operation-level parameters. Parameter identity is
 * (name, in); operation-level entries override path-level duplicates.
 */
export function mergeParameters(
  pathLevel: unknown,
  operationLevel: unknown
): APIParameter[] {
  const merged = new Map<string, APIParameter>()

  for (const input of [...toArray(pathLevel), ...toArray(operationLevel)]) {
    const parameter = normalizeParameter(input)
    if (parameter === undefined) continue
    merged.set(`${parameter.in}:${parameter.name}`, parameter)
  }

  return [...merged.values()]
}

export function bucketParametersByLocation(
  parameters: APIParameter[]
): Record<ParameterLocation, APIParameter[]> {
  const buckets: Record<ParameterLocation, APIParameter[]> = {
    path: [],
    query: [],
    header: [],
    cookie: [],
  }
  for (const parameter of parameters) {
    buckets[parameter.in].push(parameter)
  }
  return buckets
}

export function normalizeHeaders(input: unknown): APIHeader[] {
  if (!isRecord(input)) return []
  return Object.entries(input).map(([name, value]) => {
    const record = isRecord(value) ? value : {}
    return {
      name,
      description: optionalString(record.description),
      required: record.required === true,
      deprecated: record.deprecated === true,
      schema: record.schema !== undefined ? normalizeSchema(record.schema) : undefined,
    }
  })
}

export function normalizeLinks(input: unknown): APILink[] {
  if (!isRecord(input)) return []
  return Object.entries(input).map(([name, value]) => {
    const record = isRecord(value) ? value : {}
    return {
      name,
      operationId: optionalString(record.operationId),
      operationRef: optionalString(record.operationRef),
      description: optionalString(record.description),
      parameters: isRecord(record.parameters) ? record.parameters : undefined,
      requestBody: record.requestBody,
      server:
        isRecord(record.server) && typeof record.server.url === "string"
          ? {
              url: record.server.url,
              description: optionalString(record.server.description),
            }
          : undefined,
    }
  })
}

export function normalizeResponses(input: unknown): APIResponse[] {
  if (!isRecord(input)) return []

  const responses = Object.entries(input).map(([status, value]) => {
    const record = isRecord(value) ? value : {}
    const statusCode = Number.parseInt(status, 10)
    const numeric = Number.isNaN(statusCode) ? undefined : statusCode

    return {
      status,
      statusCode: numeric,
      description: optionalString(record.description),
      headers: normalizeHeaders(record.headers),
      content: normalizeContent(record.content),
      links: normalizeLinks(record.links),
      isSuccess: numeric !== undefined && numeric >= 200 && numeric < 300,
      isError: numeric !== undefined && numeric >= 400,
      isRedirect: numeric !== undefined && numeric >= 300 && numeric < 400,
      isDefault: status === "default",
    }
  })

  return responses.sort((a, b) => {
    if (a.isDefault) return 1
    if (b.isDefault) return -1
    return (a.statusCode ?? 0) - (b.statusCode ?? 0)
  })
}

export function normalizeExternalDocs(input: unknown): ExternalDocs | undefined {
  if (!isRecord(input) || typeof input.url !== "string") return undefined
  return { url: input.url, description: optionalString(input.description) }
}

function toArray(input: unknown): unknown[] {
  return Array.isArray(input) ? input : []
}
