import type { APISchema, APISchemaProperty } from "../types/index.js"
import { isRecord } from "./servers.js"

/**
 * Normalize a raw JSON Schema object into an `APISchema`.
 *
 * After ref resolution the schema is already plain data, so normalization is
 * a defensive clone plus inference of the declared type when it is missing
 * (e.g. `type` absent but `properties` present → object).
 */
export function normalizeSchema(input: unknown): APISchema {
  if (!isRecord(input)) {
    return {}
  }

  const schema: APISchema = structuredClone(input) as APISchema

  if (schema.type === undefined) {
    const inferred = inferSchemaType(schema)
    if (inferred !== undefined) {
      schema.type = inferred
    }
  }

  return schema
}

export function inferSchemaType(schema: APISchema): string | undefined {
  if (schema.properties !== undefined) return "object"
  if (schema.additionalProperties !== undefined && schema.additionalProperties !== false) return "object"
  if (schema.items !== undefined) return "array"
  if (schema.enum !== undefined || schema.const !== undefined) return "string"
  if (schema.minimum !== undefined || schema.maximum !== undefined || schema.multipleOf !== undefined) return "number"
  if (schema.minLength !== undefined || schema.maxLength !== undefined || schema.pattern !== undefined) return "string"
  if (schema.allOf !== undefined || schema.anyOf !== undefined || schema.oneOf !== undefined) return undefined
  return undefined
}

/** Type guards for common schema shapes. */
export function isObjectSchema(schema: APISchema): boolean {
  const type = schema.type
  return type === "object" || (Array.isArray(type) && type.includes("object"))
}

export function isArraySchema(schema: APISchema): boolean {
  const type = schema.type
  return type === "array" || (Array.isArray(type) && type.includes("array"))
}

export function isStringSchema(schema: APISchema): boolean {
  const type = schema.type
  return type === "string" || (Array.isArray(type) && type.includes("string"))
}

export function isNumberSchema(schema: APISchema): boolean {
  const type = schema.type
  return (
    type === "number" ||
    type === "integer" ||
    (Array.isArray(type) && (type.includes("number") || type.includes("integer")))
  )
}

export function isBooleanSchema(schema: APISchema): boolean {
  const type = schema.type
  return type === "boolean" || (Array.isArray(type) && type.includes("boolean"))
}

export function isEnumSchema(schema: APISchema): boolean {
  return schema.enum !== undefined && schema.enum.length > 0
}

export function isNullableSchema(schema: APISchema): boolean {
  if (schema.nullable === true) return true
  return Array.isArray(schema.type) && schema.type.includes("null")
}

export function isReferenceSchema(schema: APISchema): boolean {
  return typeof schema.ref === "string" || typeof schema["$ref"] === "string"
}

/** The declared (or inferred) type of a schema, flattening 3.1 type arrays. */
export function getSchemaType(schema: APISchema): string | undefined {
  if (Array.isArray(schema.type)) {
    const nonNull = schema.type.find((t) => t !== "null")
    return nonNull
  }
  return schema.type ?? inferSchemaType(schema)
}

/** Schema properties as first-class `APISchemaProperty` entries (recursive tree ready). */
export function getSchemaProperties(schema: APISchema): APISchemaProperty[] {
  if (schema.properties === undefined) return []

  const required = new Set(schema.required ?? [])

  return Object.entries(schema.properties).map(([name, property]) => {
    const propertySchema = property as APISchema
    return {
      name,
      schema: propertySchema,
      required: required.has(name),
      description: propertySchema.description,
      deprecated: propertySchema.deprecated === true,
      readOnly: propertySchema.readOnly === true,
      writeOnly: propertySchema.writeOnly === true,
    }
  })
}

/** The best example for a schema: explicit example, then default, then generated. */
export function getSchemaExample(schema: APISchema): unknown {
  if (schema.example !== undefined) return schema.example
  if (schema.default !== undefined) return schema.default
  return generateSchemaExample(schema)
}

/** Follow a schema's `ref` marker into `api.schemas`, if possible. */
export function resolveSchema(
  schema: APISchema,
  schemas: Record<string, APISchema>
): APISchema {
  const ref = schema.ref ?? schema["$ref"]
  if (typeof ref !== "string") return schema

  const name = ref.split("/").pop()
  if (name === undefined) return schema

  const resolved = schemas[name]
  return resolved !== undefined ? resolved : schema
}

/**
 * Generate an example value from a schema, e.g. `{ id: 0, name: "string" }`
 * from a `User` schema. Explicit `example` / `default` / `const` / first
 * `enum` values always win; otherwise a value is derived from the shape.
 */
export function generateSchemaExample(schema: APISchema): unknown {
  if (schema.const !== undefined) return schema.const
  if (schema.example !== undefined) return schema.example
  if (schema.default !== undefined) return schema.default
  if (schema.enum !== undefined && schema.enum.length > 0) return schema.enum[0]

  // Unresolvable reference
  if (schema["$ref"] !== undefined) return null

  if (schema.allOf !== undefined && schema.allOf.length > 0) {
    return generateSchemaExample(schema.allOf[0] as APISchema)
  }
  if (schema.anyOf !== undefined && schema.anyOf.length > 0) {
    return generateSchemaExample(schema.anyOf[0] as APISchema)
  }
  if (schema.oneOf !== undefined && schema.oneOf.length > 0) {
    return generateSchemaExample(schema.oneOf[0] as APISchema)
  }

  const type = getSchemaType(schema)

  if (isArraySchema(schema) || type === "array") {
    const items = Array.isArray(schema.items) ? schema.items[0] : schema.items
    if (items === undefined) return []
    return [generateSchemaExample(items as APISchema)]
  }

  if (isObjectSchema(schema) || type === "object") {
    if (schema.properties === undefined) return {}
    const example: Record<string, unknown> = {}
    for (const [name, property] of Object.entries(schema.properties)) {
      example[name] = generateSchemaExample(property as APISchema)
    }
    return example
  }

  if (isNumberSchema(schema) || type === "number" || type === "integer") {
    if (schema.minimum !== undefined) return schema.minimum
    if (schema.maximum !== undefined) return 0
    return 0
  }

  if (isBooleanSchema(schema) || type === "boolean") {
    return true
  }

  if (isStringSchema(schema) || type === "string") {
    return exampleFromStringFormat(schema.format)
  }

  return null
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
      return "binary data"
    default:
      return "string"
  }
}
