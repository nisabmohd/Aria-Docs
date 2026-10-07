/** True for plain, non-array objects. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Own-property check that never consults the prototype chain. */
export function hasOwn(object: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(object, key)
}

/**
 * Read an own property. Returns `undefined` for inherited keys, so lookups
 * such as `getOwn(schemas, "constructor")` or `getOwn(schemas, "__proto__")`
 * never leak `Object.prototype` members.
 */
export function getOwn<T>(record: Record<string, T>, key: string): T | undefined {
  return hasOwn(record, key) ? record[key] : undefined
}

/**
 * Assign an own, enumerable property. Unlike `object[key] = value`, a key of
 * `"__proto__"` becomes a regular property instead of replacing the object's
 * prototype, which closes the prototype-pollution hole that untrusted
 * JSON/YAML keys would otherwise open.
 */
export function setOwn<T>(record: Record<string, T>, key: string, value: T): void {
  if (key === "__proto__") {
    Object.defineProperty(record, key, {
      value,
      enumerable: true,
      writable: true,
      configurable: true,
    })
    return
  }
  record[key] = value
}

/** `typeof value === "string"` → value, otherwise `undefined`. */
export function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined
}

/** Keep only the string items of an array; `undefined` if none remain. */
export function optionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const strings = value.filter((item): item is string => typeof item === "string")
  return strings.length > 0 ? strings : undefined
}
