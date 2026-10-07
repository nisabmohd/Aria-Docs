import { getOwn, isRecord } from "@ariadocs/core"
import { parsePointer } from "../refs/pointer.js"
import type { APISchema, APISchemaProperty } from "../types/index.js"

/**
 * Normalize a raw JSON Schema object into an `APISchema`: a shallow copy
 * (the input is never mutated) with the type inferred when it is missing,
 * e.g. `properties` present → `"object"`.
 */
export function normalizeSchema(input: unknown): APISchema {
  if (!isRecord(input)) {
    // JSON Schema 2020-12 allows boolean schemas: `true` = anything.
    return {}
  }

  const schema: APISchema = { ...(input as APISchema) }
  if (schema.type === undefined) {
    const inferred = inferSchemaType(schema)
    if (inferred !== undefined) schema.type = inferred
  }
  return schema
}

export function inferSchemaType(schema: APISchema): string | undefined {
  if (schema.properties !== undefined) return "object"
  if (isRecord(schema.additionalProperties)) return "object"
  if (schema.additionalProperties === true) return "object"
  if (schema.items !== undefined) return "array"

  const literal = schema.const !== undefined ? [schema.const] : schema.enum
  if (Array.isArray(literal) && literal.length > 0) {
    const types = new Set(literal.filter((value) => value !== null).map(jsonType))
    return types.size === 1 ? [...types][0] : undefined
  }

  if (
    schema.minimum !== undefined ||
    schema.maximum !== undefined ||
    schema.multipleOf !== undefined ||
    typeof schema.exclusiveMinimum === "number" ||
    typeof schema.exclusiveMaximum === "number"
  ) {
    return "number"
  }
  if (schema.minLength !== undefined || schema.maxLength !== undefined || schema.pattern !== undefined) {
    return "string"
  }
  if (schema.format !== undefined) return "string"
  return undefined
}

function jsonType(value: unknown): string {
  if (Array.isArray(value)) return "array"
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "number"
  return typeof value
}

function hasType(schema: APISchema, ...types: string[]): boolean {
  const type = schema.type
  if (typeof type === "string") return types.includes(type)
  return Array.isArray(type) && type.some((item) => types.includes(item))
}

export function isObjectSchema(schema: APISchema): boolean {
  return hasType(schema, "object")
}

export function isArraySchema(schema: APISchema): boolean {
  return hasType(schema, "array")
}

export function isStringSchema(schema: APISchema): boolean {
  return hasType(schema, "string")
}

export function isNumberSchema(schema: APISchema): boolean {
  return hasType(schema, "number", "integer")
}

export function isBooleanSchema(schema: APISchema): boolean {
  return hasType(schema, "boolean")
}

export function isEnumSchema(schema: APISchema): boolean {
  return Array.isArray(schema.enum) && schema.enum.length > 0
}

export function isNullableSchema(schema: APISchema): boolean {
  if (schema.nullable === true) return true
  if (Array.isArray(schema.type) && schema.type.includes("null")) return true
  return [schema.oneOf, schema.anyOf].some(
    (variants) => Array.isArray(variants) && variants.some((variant) => isRecord(variant) && variant.type === "null")
  )
}

/** True for schemas that came from a `$ref` (`ref`) or still are one (`$ref`). */
export function isReferenceSchema(schema: APISchema): boolean {
  return typeof schema.ref === "string" || typeof schema.$ref === "string"
}

/** The declared (or inferred) type, ignoring `null` in OpenAPI 3.1 type arrays. */
export function getSchemaType(schema: APISchema): string | undefined {
  if (Array.isArray(schema.type)) {
    return schema.type.find((type) => type !== "null") ?? (schema.type.length > 0 ? "null" : undefined)
  }
  return schema.type ?? inferSchemaType(schema)
}

/**
 * A readable type label for UIs: `string`, `string<email>`, `Pet[]`,
 * `string | null`, `oneOf`, `$ref: User`, ...
 */
export function getSchemaTypeLabel(schema: APISchema): string {
  if (typeof schema.$ref === "string") return getSchemaName(schema.$ref) ?? "$ref"

  const type = getSchemaType(schema)
  let label: string

  if (type === "array") {
    const items = Array.isArray(schema.items) ? schema.items[0] : schema.items
    label = items !== undefined && isRecord(items) ? `${getSchemaTypeLabel(items)}[]` : "array"
  } else if (type === "object" && typeof schema.ref === "string" && schema.ref.startsWith("#/components/schemas/")) {
    // A named schema reads better as its name than as "object".
    label = getSchemaName(schema.ref) ?? type
  } else if (type !== undefined) {
    label = schema.format !== undefined ? `${type}<${schema.format}>` : type
  } else if (Array.isArray(schema.oneOf) || Array.isArray(schema.anyOf)) {
    label = variantsLabel((schema.oneOf ?? schema.anyOf) as APISchema[], schema.oneOf !== undefined ? "oneOf" : "anyOf")
  } else if (schema.allOf !== undefined) {
    label = getSchemaName(schema.ref) ?? "object"
  } else {
    label = "any"
  }

  return isNullableSchema(schema) && !label.endsWith(" | null") ? `${label} | null` : label
}

/** `string | string[]` for short unions of simple types, else `oneOf` / `anyOf`. */
function variantsLabel(variants: APISchema[], fallback: string): string {
  const labels = variants.filter((variant): variant is APISchema => isRecord(variant)).map((variant) =>
    variant.title !== undefined && getSchemaType(variant) === "object" ? variant.title : getSchemaTypeLabel(variant)
  )
  const unique = [...new Set(labels)]
  return unique.length > 0 && unique.length <= 4 && unique.every((label) => !label.includes(" ")) ? unique.join(" | ") : fallback
}

/** `#/components/schemas/User` → `"User"`. */
export function getSchemaName(ref: string | undefined): string | undefined {
  if (ref === undefined) return undefined
  return parsePointer(ref.slice(ref.indexOf("#"))).pop()
}

/**
 * Schema properties as `APISchemaProperty` entries, ready for tree
 * rendering. Properties from `allOf` members are merged in, so composed
 * schemas (`allOf: [Base, { properties }]`) list all their fields.
 */
export function getSchemaProperties(schema: APISchema): APISchemaProperty[] {
  const properties = new Map<string, APISchema>()
  const required = new Set<string>()
  collectProperties(schema, properties, required, 0)

  return [...properties.entries()].map(([name, property]) => ({
    name,
    schema: property,
    required: required.has(name),
    description: property.description,
    deprecated: property.deprecated === true,
    readOnly: property.readOnly === true,
    writeOnly: property.writeOnly === true,
  }))
}

function collectProperties(
  schema: APISchema,
  properties: Map<string, APISchema>,
  required: Set<string>,
  depth: number
): void {
  if (depth > 16) return

  if (Array.isArray(schema.allOf)) {
    for (const member of schema.allOf) {
      if (isRecord(member)) collectProperties(member, properties, required, depth + 1)
    }
  }

  if (isRecord(schema.properties)) {
    for (const [name, property] of Object.entries(schema.properties)) {
      properties.set(name, isRecord(property) ? normalizeSchema(property) : {})
    }
  }

  if (Array.isArray(schema.required)) {
    for (const name of schema.required) {
      if (typeof name === "string") required.add(name)
    }
  }
}

/** The best example for a schema: explicit `example`/`examples`, then `default`, then generated. */
export function getSchemaExample(schema: APISchema): unknown {
  if (schema.example !== undefined) return schema.example
  if (Array.isArray(schema.examples) && schema.examples.length > 0) return schema.examples[0]
  if (schema.default !== undefined) return schema.default
  return generateSchemaExample(schema)
}

/** Follow a schema's `ref`/`$ref` into `api.schemas`, when it points there. */
export function resolveSchema(schema: APISchema, schemas: Record<string, APISchema>): APISchema {
  const ref = schema.$ref ?? schema.ref
  if (typeof ref !== "string" || !ref.startsWith("#/components/schemas/")) return schema

  const segments = parsePointer(ref)
  if (segments.length !== 3) return schema

  const name = segments[2]
  return (name !== undefined ? getOwn(schemas, name) : undefined) ?? schema
}

export interface GenerateExampleOptions {
  /**
   * `"request"` leaves out `readOnly` properties, `"response"` leaves out
   * `writeOnly` ones. Default: include both.
   */
  mode?: "request" | "response"
  /** Maximum nesting depth (default `8`). */
  maxDepth?: number
  /** Maximum number of generated values, guarding against huge schemas (default `1000`). */
  maxNodes?: number
}

/**
 * Generate an example value from a schema, e.g. `{ id: 0, name: "string" }`.
 * Explicit `const` / `example` / `examples` / `default` / first `enum`
 * values win; otherwise a value is derived from the shape. Output size is
 * bounded by `maxDepth` and `maxNodes`, so recursive or very wide schemas
 * stay cheap.
 */
export function generateSchemaExample(schema: APISchema, options: GenerateExampleOptions = {}): unknown {
  const state = {
    mode: options.mode,
    maxDepth: options.maxDepth ?? 8,
    budget: options.maxNodes ?? 1000,
    refs: new Set<string>(),
  }
  return generate(schema, state, 0)
}

interface GenerateState {
  mode?: "request" | "response"
  maxDepth: number
  budget: number
  /** `ref` markers on the current path, to stop at recursion. */
  refs: Set<string>
}

function generate(schema: APISchema, state: GenerateState, depth: number): unknown {
  state.budget -= 1
  if (state.budget < 0 || depth > state.maxDepth) return undefined
  if (!isRecord(schema)) return undefined

  if (schema.const !== undefined) return schema.const
  if (schema.example !== undefined) return schema.example
  if (Array.isArray(schema.examples) && schema.examples.length > 0) return schema.examples[0]
  if (schema.default !== undefined) return schema.default
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum[0]

  // Unresolved or recursive reference.
  if (schema.$ref !== undefined) return null
  if (typeof schema.ref === "string") {
    if (state.refs.has(schema.ref)) return null
    state.refs.add(schema.ref)
    const value = generateShape(schema, state, depth)
    state.refs.delete(schema.ref)
    return value
  }

  return generateShape(schema, state, depth)
}

function generateShape(schema: APISchema, state: GenerateState, depth: number): unknown {
  if (Array.isArray(schema.allOf) && schema.allOf.length > 0) {
    const parts = schema.allOf.map((member) => generate(member, state, depth + 1))
    if (parts.every((part) => isRecord(part))) {
      const own = schema.properties !== undefined ? generateObject(schema, state, depth) : {}
      return Object.assign({}, ...parts, own)
    }
    return parts.find((part) => part !== undefined)
  }

  for (const variants of [schema.oneOf, schema.anyOf]) {
    if (Array.isArray(variants)) {
      const variant = variants.find((item) => isRecord(item) && item.type !== "null") ?? variants[0]
      if (variant !== undefined) return generate(variant, state, depth + 1)
    }
  }

  const type = getSchemaType(schema)

  switch (type) {
    case "object":
      return generateObject(schema, state, depth)
    case "array": {
      const items = Array.isArray(schema.items) ? schema.items[0] : schema.items
      if (items === undefined) return []
      const item = generate(items, state, depth + 1)
      return item === undefined ? [] : [item]
    }
    case "integer":
    case "number": {
      if (typeof schema.minimum === "number") return schema.minimum
      if (typeof schema.exclusiveMinimum === "number") {
        return type === "integer" ? Math.floor(schema.exclusiveMinimum) + 1 : schema.exclusiveMinimum + 1
      }
      if (typeof schema.maximum === "number" && schema.maximum < 0) return schema.maximum
      return 0
    }
    case "boolean":
      return true
    case "string":
      return exampleFromStringFormat(schema.format)
    case "null":
      return null
    default:
      return schema.properties !== undefined ? generateObject(schema, state, depth) : null
  }
}

function generateObject(schema: APISchema, state: GenerateState, depth: number): Record<string, unknown> {
  const example: Record<string, unknown> = {}
  if (!isRecord(schema.properties)) return example

  for (const [name, property] of Object.entries(schema.properties)) {
    if (!isRecord(property)) continue
    if (state.mode === "request" && property.readOnly === true) continue
    if (state.mode === "response" && property.writeOnly === true) continue
    const value = generate(property, state, depth + 1)
    if (value !== undefined) {
      Object.defineProperty(example, name, { value, enumerable: true, writable: true, configurable: true })
    }
  }
  return example
}

function exampleFromStringFormat(format: string | undefined): string {
  switch (format) {
    case "email":
      return "user@example.com"
    case "date-time":
      return "2024-01-01T00:00:00Z"
    case "date":
      return "2024-01-01"
    case "time":
      return "00:00:00Z"
    case "uri":
    case "url":
    case "uri-reference":
      return "https://example.com"
    case "uuid":
      return "123e4567-e89b-12d3-a456-426614174000"
    case "ipv4":
      return "192.168.1.1"
    case "ipv6":
      return "2001:db8::1"
    case "hostname":
      return "example.com"
    case "byte":
      return "dGVzdA=="
    case "binary":
      return "<binary>"
    case "password":
      return "********"
    default:
      return "string"
  }
}
