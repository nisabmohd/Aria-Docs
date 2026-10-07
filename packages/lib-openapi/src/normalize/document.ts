import {
  createIdGenerator,
  isRecord,
  optionalString,
  sanitizeUrl,
  setOwn,
  slugify,
} from "@ariadocs/core"
import { OpenAPIError } from "../errors.js"
import type {
  APICallback,
  APIOperation,
  APIRequestBody,
  APISecurityRequirement,
  APIServer,
  APISpec,
  APITag,
  APIWebhook,
  OpenAPIDocument,
} from "../types/index.js"
import { createOperationId } from "../utils/operation-id.js"
import {
  groupParametersByLocation,
  isHttpMethod,
  mergeParameters,
  normalizeContent,
  normalizeExternalDocs,
  normalizeResponses,
} from "./parameters.js"
import { asJsonObject } from "./json.js"
import { normalizeSchema } from "./schema.js"
import { normalizeSecurityRequirements, normalizeSecuritySchemes } from "./security.js"
import { DEFAULT_SERVERS, normalizeServers } from "./servers.js"

export interface NormalizeOptions {
  /** Keep the raw document on `api.raw` and raw operations on `operation.raw`. */
  includeRaw?: boolean
  /** Warnings collected earlier (e.g. while resolving refs) to carry into `api.warnings`. */
  warnings?: string[]
}

/** Name of the tag that collects operations without tags. */
export const DEFAULT_TAG = "default"

interface Context {
  options: NormalizeOptions
  uniqueId: (id: string) => string
  /** Security inherited by operations that don't declare their own. */
  security: APISecurityRequirement[]
}

/**
 * Normalize an OpenAPI document (refs already resolved) into the `APISpec`
 * model. Invalid parts are skipped rather than guessed, so the model never
 * shows data the document doesn't contain.
 */
export function normalizeOpenAPI(document: OpenAPIDocument, options: NormalizeOptions = {}): APISpec {
  if (!isRecord(document)) {
    throw new OpenAPIError("OpenAPI document must be an object.", "OPENAPI_INVALID", {
      issues: [{ path: "", message: "Document must be an object." }],
    })
  }

  const info = isRecord(document.info) ? document.info : {}
  const components = isRecord(document.components) ? document.components : {}
  const servers = normalizeServers(document.servers) ?? DEFAULT_SERVERS
  const security = normalizeSecurityRequirements(document.security)
  const uniqueId = createIdGenerator()

  const paths: Record<string, APIOperation[]> = {}
  const operations: APIOperation[] = []

  if (isRecord(document.paths)) {
    const context: Context = { options, uniqueId, security }
    for (const [path, pathItem] of Object.entries(document.paths)) {
      if (!isRecord(pathItem)) continue
      const pathOperations = normalizePathItem(path, pathItem, servers, context)
      if (pathOperations.length > 0) {
        setOwn(paths, path, pathOperations)
        operations.push(...pathOperations)
      }
    }
  }

  const schemas: APISpec["schemas"] = {}
  if (isRecord(components.schemas)) {
    for (const [name, schema] of Object.entries(components.schemas)) {
      setOwn(schemas, name, normalizeSchema(schema))
    }
  }

  const api: APISpec = {
    type: "openapi",
    version: typeof document.openapi === "string" ? document.openapi : "3.1.0",
    info: {
      title: nonEmptyString(info.title) ?? "Untitled API",
      version: scalarString(info.version) ?? "0.0.0",
      summary: optionalString(info.summary),
      description: optionalString(info.description),
      termsOfService: sanitizeUrl(info.termsOfService),
      contact: isRecord(info.contact)
        ? {
            name: optionalString(info.contact.name),
            url: sanitizeUrl(info.contact.url),
            email: optionalString(info.contact.email),
          }
        : undefined,
      license: isRecord(info.license)
        ? {
            name: optionalString(info.license.name),
            identifier: optionalString(info.license.identifier),
            url: sanitizeUrl(info.license.url),
          }
        : undefined,
    },
    servers,
    tags: buildTags(operations, document.tags),
    paths,
    operations,
    schemas,
    securitySchemes: normalizeSecuritySchemes(components.securitySchemes),
    webhooks: normalizeWebhooks(document.webhooks, servers, { options, uniqueId, security: [] }),
    security,
    externalDocs: normalizeExternalDocs(document.externalDocs),
    warnings: [...(options.warnings ?? [])],
  }

  if (options.includeRaw) {
    api.raw = asJsonObject(document)
  }

  return api
}

function normalizePathItem(
  path: string,
  pathItem: Record<string, unknown>,
  inheritedServers: APIServer[],
  context: Context
): APIOperation[] {
  const operations: APIOperation[] = []
  const pathServers = normalizeServers(pathItem.servers) ?? inheritedServers

  for (const key of Object.keys(pathItem)) {
    if (!isHttpMethod(key)) continue

    const operation = pathItem[key]
    if (!isRecord(operation)) continue

    const method = key.toUpperCase() as APIOperation["method"]
    const operationId = nonEmptyString(operation.operationId)
    const parameters = mergeParameters(pathItem.parameters, operation.parameters)

    const normalized: APIOperation = {
      id: context.uniqueId(createOperationId({ method, path, operationId })),
      operationId,
      method,
      path,
      summary: optionalString(operation.summary) ?? optionalString(pathItem.summary),
      description: optionalString(operation.description) ?? optionalString(pathItem.description),
      tags: Array.isArray(operation.tags)
        ? [...new Set(operation.tags.filter((tag): tag is string => typeof tag === "string"))]
        : [],
      parameters,
      parametersByLocation: groupParametersByLocation(parameters),
      requestBody: normalizeRequestBody(operation.requestBody),
      responses: normalizeResponses(operation.responses),
      // `security: []` explicitly removes inherited security.
      security: Array.isArray(operation.security)
        ? normalizeSecurityRequirements(operation.security)
        : context.security,
      servers: normalizeServers(operation.servers) ?? pathServers,
      deprecated: operation.deprecated === true,
      callbacks: normalizeCallbacks(operation.callbacks, pathServers, context),
      externalDocs: normalizeExternalDocs(operation.externalDocs),
    }

    if (context.options.includeRaw) {
      normalized.raw = asJsonObject(operation)
    }

    operations.push(normalized)
  }

  return operations
}

export function normalizeRequestBody(input: unknown): APIRequestBody | undefined {
  if (!isRecord(input) || typeof input.$ref === "string") return undefined

  const content = normalizeContent(input.content)
  return {
    description: optionalString(input.description),
    required: input.required === true,
    content,
    preferredContentType: preferContentType(content),
  }
}

function preferContentType(content: APIRequestBody["content"]): string | undefined {
  const json = content.find((item) => /[/+]json\b/i.test(item.mediaType))
  return (json ?? content[0])?.mediaType
}

function normalizeCallbacks(input: unknown, servers: APIServer[], context: Context): APICallback[] {
  if (!isRecord(input)) return []

  const callbacks: APICallback[] = []
  for (const [name, value] of Object.entries(input)) {
    if (!isRecord(value)) continue

    for (const [expression, pathItem] of Object.entries(value)) {
      if (!isRecord(pathItem)) continue
      // Callback keys are runtime expressions such as `{$request.body#/url}`.
      const operations = normalizePathItem(expression, pathItem, servers, { ...context, security: [] })
      if (operations.length > 0) {
        callbacks.push({
          name,
          expression,
          description: optionalString(pathItem.description),
          operations,
        })
      }
    }
  }

  return callbacks
}

function normalizeWebhooks(input: unknown, servers: APIServer[], context: Context): APIWebhook[] {
  if (!isRecord(input)) return []

  const webhookId = createIdGenerator()
  const webhooks: APIWebhook[] = []
  for (const [name, value] of Object.entries(input)) {
    if (!isRecord(value)) continue

    const operations = normalizePathItem(name, value, servers, context)
    if (operations.length === 0) continue

    webhooks.push({
      id: webhookId(slugify(name, "webhook")),
      name,
      description: optionalString(value.description),
      operations,
    })
  }

  return webhooks
}

interface TagDefinition {
  title?: string
  description?: string
  externalDocs?: APITag["externalDocs"]
}

/** Group operations by tag: declared tags first (in order), then undeclared ones, then `default`. */
function buildTags(operations: APIOperation[], rawTags: unknown): APITag[] {
  const definitions = new Map<string, TagDefinition>()
  if (Array.isArray(rawTags)) {
    for (const tag of rawTags) {
      if (!isRecord(tag) || typeof tag.name !== "string" || definitions.has(tag.name)) continue
      definitions.set(tag.name, {
        title: nonEmptyString(tag["x-displayName"]),
        description: optionalString(tag.description),
        externalDocs: normalizeExternalDocs(tag.externalDocs),
      })
    }
  }

  const buckets = new Map<string, APIOperation[]>()
  for (const name of definitions.keys()) buckets.set(name, [])

  for (const operation of operations) {
    const names = operation.tags.length > 0 ? operation.tags : [DEFAULT_TAG]
    for (const name of names) {
      const bucket = buckets.get(name) ?? []
      bucket.push(operation)
      buckets.set(name, bucket)
    }
  }

  // Untagged operations go last, unless "default" is a declared tag.
  const defaultBucket = buckets.get(DEFAULT_TAG)
  if (defaultBucket !== undefined && !definitions.has(DEFAULT_TAG)) {
    buckets.delete(DEFAULT_TAG)
    buckets.set(DEFAULT_TAG, defaultBucket)
  }

  const uniqueId = createIdGenerator()
  return [...buckets.entries()]
    .filter(([, bucket]) => bucket.length > 0)
    .map(([name, bucket]) => {
      const definition = definitions.get(name)
      return {
        id: uniqueId(slugify(name, "tag")),
        name,
        title: definition?.title ?? (name === DEFAULT_TAG && definition === undefined ? "Default" : name),
        description: definition?.description,
        operations: bucket,
        externalDocs: definition?.externalDocs,
      }
    })
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined
}

function scalarString(value: unknown): string | undefined {
  if (typeof value === "number") return String(value)
  return nonEmptyString(value)
}
