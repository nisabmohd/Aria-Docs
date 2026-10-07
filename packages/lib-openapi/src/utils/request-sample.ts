import { getOwn } from "@ariadocs/core"
import { generateSchemaExample } from "../normalize/schema.js"
import type {
  APIContent,
  APIOperation,
  APIParameter,
  APISecurityScheme,
  APIServer,
  HTTPMethod,
} from "../types/index.js"
import { getServerUrl } from "./server-url.js"

/** A concrete example request for an operation, ready to turn into code. */
export interface APIRequestSample {
  method: HTTPMethod
  /** Absolute (or server-relative) URL with path and query parameters filled in. */
  url: string
  /** Header name/value pairs in send order. */
  headers: [string, string][]
  contentType?: string
  /** Body example (structured) for JSON/form content. */
  body?: unknown
  /** True when the body should be sent as multipart form data. */
  multipart?: boolean
}

export interface CreateRequestSampleOptions {
  /** Server to call (default: the operation's first server). */
  server?: APIServer
  /** Values for server URL variables. */
  serverVariables?: Record<string, string>
  /** Security schemes (`api.securitySchemes`) used to add auth placeholders. */
  securitySchemes?: Record<string, APISecurityScheme>
  /** Media type for the body (default: the request body's preferred content type). */
  contentType?: string
}

/** Build an example request from an operation's parameters, security and body. */
export function createRequestSample(
  operation: APIOperation,
  options: CreateRequestSampleOptions = {}
): APIRequestSample {
  const server = options.server ?? operation.servers[0]
  const base = server !== undefined ? getServerUrl(server, options.serverVariables).replace(/\/+$/, "") : ""

  const path = operation.path.replace(/\{([^{}]+)\}/g, (match, name: string) => {
    const parameter = operation.parametersByLocation.path.find((item) => item.name === name)
    const value = parameter !== undefined ? parameterValue(parameter) : undefined
    return value === undefined ? match : encodeComponent(stringify(value))
  })

  const query: [string, string][] = []
  const headers: [string, string][] = []
  const cookies: string[] = []

  for (const parameter of operation.parameters) {
    if (parameter.in === "path") continue
    if (!parameter.required && parameterExample(parameter) === undefined) continue
    const value = parameterValue(parameter)
    if (value === undefined) continue

    if (parameter.in === "query") {
      if (Array.isArray(value) && parameter.explode) {
        for (const item of value) query.push([parameter.name, stringify(item)])
      } else {
        query.push([parameter.name, Array.isArray(value) ? value.map(stringify).join(",") : stringify(value)])
      }
    } else if (parameter.in === "header") {
      headers.push([parameter.name, stringify(value)])
    } else {
      cookies.push(`${parameter.name}=${encodeComponent(stringify(value))}`)
    }
  }

  addSecurity(operation, options.securitySchemes, headers, query, cookies)
  if (cookies.length > 0) headers.push(["Cookie", cookies.join("; ")])

  const sample: APIRequestSample = {
    method: operation.method,
    url: base + path + (query.length > 0 ? `?${new URLSearchParams(query).toString()}` : ""),
    headers,
  }

  const content = pickContent(operation, options.contentType)
  if (content !== undefined) {
    sample.contentType = content.mediaType
    sample.body = contentExample(content)
    if (/^multipart\//i.test(content.mediaType)) {
      sample.multipart = true
    } else {
      headers.push(["Content-Type", content.mediaType])
    }
  }

  // Header injection guard: no CR/LF in names or values.
  sample.headers = headers.map(([name, value]) => [stripNewlines(name), stripNewlines(value)])
  return sample
}

function addSecurity(
  operation: APIOperation,
  schemes: Record<string, APISecurityScheme> | undefined,
  headers: [string, string][],
  query: [string, string][],
  cookies: string[]
): void {
  if (schemes === undefined) return
  const requirement = operation.security[0]
  if (requirement === undefined) return

  for (const { name } of requirement.schemes) {
    const scheme = getOwn(schemes, name)
    if (scheme === undefined) continue

    if (scheme.type === "apiKey" && scheme.name !== undefined) {
      const placeholder = `<${scheme.name.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}>`
      if (scheme.in === "query") query.push([scheme.name, placeholder])
      else if (scheme.in === "cookie") cookies.push(`${scheme.name}=${placeholder}`)
      else headers.push([scheme.name, placeholder])
    } else if (scheme.type === "http" && scheme.scheme === "basic") {
      headers.push(["Authorization", "Basic <CREDENTIALS>"])
    } else if (scheme.type === "http" || scheme.type === "oauth2" || scheme.type === "openIdConnect") {
      headers.push(["Authorization", "Bearer <TOKEN>"])
    }
  }
}

function pickContent(operation: APIOperation, contentType?: string): APIContent | undefined {
  const body = operation.requestBody
  if (body === undefined) return undefined
  const wanted = contentType ?? body.preferredContentType
  return body.content.find((item) => item.mediaType === wanted) ?? body.content[0]
}

/** The example for a media type: `example`, first `examples` value, else generated from the schema. */
export function getContentExample(content: APIContent, mode?: "request" | "response"): unknown {
  if (content.example !== undefined) return content.example
  const named = content.examples.find((example) => example.value !== undefined)
  if (named !== undefined) return named.value
  if (content.schema !== undefined) return generateSchemaExample(content.schema, { mode })
  return undefined
}

function contentExample(content: APIContent): unknown {
  return getContentExample(content, "request")
}

function parameterExample(parameter: APIParameter): unknown {
  if (parameter.example !== undefined) return parameter.example
  const named = parameter.examples.find((example) => example.value !== undefined)
  if (named !== undefined) return named.value
  if (parameter.schema?.example !== undefined) return parameter.schema.example
  if (parameter.schema?.default !== undefined) return parameter.schema.default
  return undefined
}

function parameterValue(parameter: APIParameter): unknown {
  const explicit = parameterExample(parameter)
  if (explicit !== undefined) return explicit
  if (parameter.schema !== undefined) return generateSchemaExample(parameter.schema, { maxDepth: 3 })
  const content = parameter.content?.[0]
  return content !== undefined ? getContentExample(content) : "string"
}

function stringify(value: unknown): string {
  if (typeof value === "string") return value
  if (value === undefined || value === null) return ""
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function encodeComponent(value: string): string {
  return value.replace(/[^A-Za-z0-9\-._~]/gu, (char) => {
    try {
      return encodeURIComponent(char)
    } catch {
      return ""
    }
  })
}

function stripNewlines(value: string): string {
  return value.replace(/[\r\n]+/g, " ")
}

export { stringify as stringifyValue }
