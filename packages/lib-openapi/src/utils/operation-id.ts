import { slugify } from "@ariadocs/core"
import type { HTTPMethod } from "../types/index.js"

export interface OperationIdInput {
  method: HTTPMethod
  path: string
  operationId?: string
}

/**
 * The id used for an operation's anchor and route.
 *
 * - With an `operationId`: kept as written, except characters outside
 *   `A-Z a-z 0-9 . _ ~ -` become `-` (`"get pet/{id}"` → `"get-pet-id"`), so
 *   the id is always safe in a URL or HTML id.
 * - Without one: generated from method + path,
 *   `GET /planets/{id}` → `"get-planets-id"`.
 */
export function createOperationId(input: OperationIdInput): string {
  if (input.operationId !== undefined) {
    const safe = input.operationId.replace(/[^A-Za-z0-9._~-]+/g, "-").replace(/^-+|-+$/g, "")
    if (safe !== "") return safe
  }
  const path = slugify(input.path.replace(/[{}]/g, ""), "root")
  return `${input.method.toLowerCase()}-${path}`
}
