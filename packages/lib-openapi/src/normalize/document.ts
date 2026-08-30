import type {
  APICallback,
  APIOperation,
  APIRequestBody,
  APISecurityRequirement,
  APITag,
  APIWebhook,
  AriadocsOpenAPI,
  OpenAPIDocument,
} from "../types/index.js"
import { createOperationId } from "../utils/operation-id.js"
import {
  bucketParametersByLocation,
  HTTP_METHODS,
  isHttpMethod,
  mergeParameters,
  normalizeContent,
  normalizeExternalDocs,
  normalizeLinks,
  normalizeResponses,
} from "./parameters.js"
import { normalizeSchema } from "./schema.js"
import { normalizeSecurityRequirements, normalizeSecuritySchemes } from "./security.js"
import { normalizeServers, isRecord, optionalString } from "./servers.js"

export interface NormalizeOptions {
  includeRaw?: boolean
}

/**
 * Normalize a (ref-resolved) OpenAPI document into the `AriadocsOpenAPI`
 * model: flattened operations, grouped navigation, typed schemas and
 * security schemes.
 */
export function normalizeDocument(
  document: OpenAPIDocument,
  options: NormalizeOptions = {}
): AriadocsOpenAPI {
  const info = isRecord(document.info) ? document.info : {}
  const components = isRecord(document.components) ? document.components : {}

  const paths: Record<string, APIOperation[]> = {}
  const operations: APIOperation[] = []

  if (isRecord(document.paths)) {
    for (const [path, pathItemValue] of Object.entries(document.paths)) {
      if (!isRecord(pathItemValue)) continue

      const pathOperations = normalizePathItem(
        path,
        pathItemValue,
        document,
        options
      )
      if (pathOperations.length > 0) {
        paths[path] = pathOperations
        operations.push(...pathOperations)
      }
    }
  }

  const groups = buildGroups(operations, document.tags)
  const tags = buildTags(operations, document.tags, groups)

  const schemas: AriadocsOpenAPI["schemas"] = {}
  if (isRecord(components.schemas)) {
    for (const [name, schema] of Object.entries(components.schemas)) {
      schemas[name] = normalizeSchema(schema)
    }
  }

  const webhooks = normalizeWebhooks(document, options)

  const api: AriadocsOpenAPI = {
    type: "openapi",
    version: typeof document.openapi === "string" ? document.openapi : "3.1.0",
    info: {
      title: typeof info.title === "string" ? info.title : "Untitled API",
      version: typeof info.version === "string" ? info.version : "0.0.0",
      description: optionalString(info.description),
      termsOfService: optionalString(info.termsOfService),
      contact: isRecord(info.contact)
        ? {
            name: optionalString(info.contact.name),
            url: optionalString(info.contact.url),
            email: optionalString(info.contact.email),
          }
        : undefined,
      license: isRecord(info.license)
        ? {
            name: optionalString(info.license.name),
            identifier: optionalString(info.license.identifier),
            url: optionalString(info.license.url),
          }
        : undefined,
    },
    servers: normalizeServers(document.servers),
    tags,
    paths,
    operations,
    groups,
    schemas,
    securitySchemes: normalizeSecuritySchemes(components.securitySchemes),
    webhooks,
    security: normalizeSecurityRequirements(document.security),
    externalDocs: normalizeExternalDocs(document.externalDocs),
  }

  if (options.includeRaw) {
    api.raw = document
  }

  return api
}

function normalizePathItem(
  path: string,
  pathItem: Record<string, unknown>,
  document: OpenAPIDocument,
  options: NormalizeOptions
): APIOperation[] {
  const operations: APIOperation[] = []
  const docSecurity = normalizeSecurityRequirements(document.security)

  for (const key of Object.keys(pathItem)) {
    if (!isHttpMethod(key)) continue

    const operationValue = pathItem[key]
    if (!isRecord(operationValue)) continue

    const method = key.toUpperCase() as APIOperation["method"]
    const operationId = optionalString(operationValue.operationId)
    const id = createOperationId({ method, path, operationId })

    const security: APISecurityRequirement[] = Array.isArray(operationValue.security)
      ? normalizeSecurityRequirements(operationValue.security)
      : docSecurity

    const parameters = mergeParameters(pathItem.parameters, operationValue.parameters)

    const operation: APIOperation = {
      id,
      operationId,
      method,
      path,
      summary: optionalString(operationValue.summary),
      description: optionalString(operationValue.description),
      tags: Array.isArray(operationValue.tags)
        ? operationValue.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
      parameters,
      parametersByLocation: bucketParametersByLocation(parameters),
      requestBody: normalizeRequestBody(operationValue.requestBody),
      responses: normalizeResponses(operationValue.responses),
      security,
      servers: normalizeOperationServers(operationValue.servers),
      deprecated: operationValue.deprecated === true,
      callbacks: normalizeCallbacks(operationValue.callbacks, options),
      externalDocs: normalizeExternalDocs(operationValue.externalDocs),
    }

    if (options.includeRaw) {
      operation.raw = operationValue
    }

    operations.push(operation)
  }

  return operations
}

function normalizeOperationServers(input: unknown): APIOperation["servers"] {
  if (!Array.isArray(input)) return []
  return input
    .filter((server): server is Record<string, unknown> => isRecord(server))
    .map((server) => ({
      url: typeof server.url === "string" ? server.url : "/",
      description: optionalString(server.description),
    }))
}

export function normalizeRequestBody(input: unknown): APIRequestBody | undefined {
  if (!isRecord(input)) return undefined

  const content = normalizeContent(input.content)

  return {
    description: optionalString(input.description),
    required: input.required === true,
    content,
    preferredContentType: preferContentType(content),
  }
}

function preferContentType(content: APIRequestBody["content"]): string | undefined {
  if (content.length === 0) return undefined
  const json = content.find((item) => item.mediaType.includes("json"))
  return (json ?? content[0])?.mediaType
}

function normalizeCallbacks(input: unknown, options: NormalizeOptions): APICallback[] {
  if (!isRecord(input)) return []

  const callbacks: APICallback[] = []
  for (const [name, value] of Object.entries(input)) {
    if (!isRecord(value)) continue

    for (const [expression, pathItemValue] of Object.entries(value)) {
      if (!isRecord(pathItemValue)) continue
      // Callback path items use `{$request.body#/...}` style expressions as keys.
      const operations = normalizePathItem(
        expression,
        pathItemValue,
        { ...emptyDocument },
        options
      )
      if (operations.length > 0) {
        callbacks.push({
          name,
          expression,
          description: optionalString(pathItemValue.description),
          operations,
        })
      }
    }
  }

  return callbacks
}

const emptyDocument: OpenAPIDocument = { openapi: "3.1.0", info: { title: "", version: "" } }

function normalizeWebhooks(document: OpenAPIDocument, options: NormalizeOptions): APIWebhook[] {
  if (!isRecord(document.webhooks)) return []

  const webhooks: APIWebhook[] = []
  for (const [name, value] of Object.entries(document.webhooks)) {
    if (!isRecord(value)) continue

    const operations = normalizePathItem(name, value, emptyDocument, options)
    if (operations.length === 0) continue

    webhooks.push({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      description: optionalString(value.description),
      operations,
      servers: normalizeOperationServers(value.servers),
    })
  }

  return webhooks
}

interface TagDefinition {
  name: string
  description?: string
  externalDocs?: { url: string; description?: string }
}

function buildGroups(operations: APIOperation[], rawTags: unknown): AriadocsOpenAPI["groups"] {
  const definitions = new Map<string, TagDefinition>()
  if (Array.isArray(rawTags)) {
    for (const tag of rawTags) {
      if (!isRecord(tag) || typeof tag.name !== "string") continue
      definitions.set(tag.name, {
        name: tag.name,
        description: optionalString(tag.description),
        externalDocs: normalizeExternalDocs(tag.externalDocs),
      })
    }
  }

  const buckets = new Map<string, APIOperation[]>()
  const order: string[] = []

  // Preserve declared tag order first.
  for (const name of definitions.keys()) {
    order.push(name)
    buckets.set(name, [])
  }

  for (const operation of operations) {
    if (operation.tags.length === 0) {
      operation.tags = ["default"]
    }
    for (const tag of operation.tags) {
      if (!buckets.has(tag)) {
        buckets.set(tag, [])
        order.push(tag)
      }
      buckets.get(tag)?.push(operation)
    }
  }

  return order
    .filter((name) => (buckets.get(name)?.length ?? 0) > 0)
    .map((name) => ({
      id: slug(name),
      name: name === "default" ? "Default" : definitions.get(name)?.name ?? name,
      description: definitions.get(name)?.description,
      operations: buckets.get(name) ?? [],
    }))
}

function buildTags(
  operations: APIOperation[],
  rawTags: unknown,
  groups: AriadocsOpenAPI["groups"]
): APITag[] {
  const definitions = new Map<string, TagDefinition>()
  if (Array.isArray(rawTags)) {
    for (const tag of rawTags) {
      if (!isRecord(tag) || typeof tag.name !== "string") continue
      definitions.set(tag.name, {
        name: tag.name,
        description: optionalString(tag.description),
        externalDocs: normalizeExternalDocs(tag.externalDocs),
      })
    }
  }

  return groups.map((group) => ({
    name: group.name,
    description: group.description,
    operations: group.operations,
    externalDocs: definitions.get(group.name)?.externalDocs,
  }))
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export { HTTP_METHODS }
