import { hasOwn } from "@ariadocs/core"

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
 * `["components", "schemas", "User"]` (RFC 6901 + URI fragment decoding).
 */
export function parsePointer(pointer: string): string[] {
  let value = pointer.startsWith("#") ? pointer.slice(1) : pointer
  if (value === "" || value === "/") return []
  value = value.replace(/^\//, "")

  return value.split("/").map((segment) => {
    let decoded = segment
    try {
      decoded = decodeURIComponent(segment)
    } catch {
      // Malformed percent-encoding: use the segment literally.
    }
    return decoded.replace(/~1/g, "/").replace(/~0/g, "~")
  })
}

/** Encode path segments into a JSON pointer, e.g. `["paths", "/a/{id}"]` → `/paths/~1a~1{id}`. */
export function toPointer(segments: string[]): string {
  return segments.map((segment) => `/${segment.replace(/~/g, "~0").replace(/\//g, "~1")}`).join("")
}

/**
 * Resolve a JSON pointer against a document. Returns `undefined` when the
 * pointer does not exist. Only own properties are followed, so pointers such
 * as `#/__proto__` or `#/components/constructor` never reach built-ins.
 */
export function resolvePointer(document: unknown, pointer: string): unknown {
  let current: unknown = document
  for (const segment of parsePointer(pointer)) {
    if (typeof current !== "object" || current === null) return undefined
    if (Array.isArray(current)) {
      if (!/^(0|[1-9]\d*)$/.test(segment)) return undefined
      current = current[Number(segment)]
      continue
    }
    if (!hasOwn(current, segment)) return undefined
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}
