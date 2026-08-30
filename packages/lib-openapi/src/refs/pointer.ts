import type { OpenAPIDocument } from "../types/index.js"

/** A `$ref` reference object as it appears in an OpenAPI document. */
export interface RefObject {
  $ref: string
  [key: string]: unknown
}

export function isRefObject(value: unknown): value is RefObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>).$ref === "string"
  )
}

export function isLocalRef(ref: string): boolean {
  return ref.startsWith("#")
}

/**
 * Parse a JSON pointer like `#/components/schemas/User` into
 * `["components", "schemas", "User"]`.
 */
export function parsePointer(pointer: string): string[] {
  if (pointer.startsWith("#")) {
    pointer = pointer.slice(1)
  }
  if (pointer === "" || pointer === "/") {
    return []
  }
  return pointer
    .replace(/^\//, "")
    .split("/")
    .map((segment) =>
      decodeURIComponent(segment.replace(/~1/g, "/").replace(/~0/g, "~"))
    )
}

/**
 * Resolve a JSON pointer against a document. Returns `undefined` when the
 * pointer does not exist.
 */
export function resolvePointer(
  document: OpenAPIDocument,
  pointer: string
): unknown {
  const segments = parsePointer(pointer)
  let current: unknown = document
  for (const segment of segments) {
    if (
      typeof current !== "object" ||
      current === null ||
      !(segment in (current as Record<string, unknown>))
    ) {
      return undefined
    }
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}
