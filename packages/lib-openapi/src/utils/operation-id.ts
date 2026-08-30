import type { HTTPMethod } from "../types/index.js"

export interface OperationIdInput {
  method: HTTPMethod
  path: string
  operationId?: string
}

/**
 * Generate a stable operation id when the document has no `operationId`.
 *
 * Fallback chain: `operationId` → `method + path` slug, e.g.
 * `GET /planets/{id}` → `"get-planets-id"`.
 */
export function createOperationId(input: OperationIdInput): string {
  if (input.operationId !== undefined && input.operationId !== "") {
    return input.operationId
  }
  return `${input.method.toLowerCase()}-${slugifyPath(input.path)}`
}

function slugifyPath(path: string): string {
  return path
    .replace(/^\//, "")
    .split("/")
    .map((segment) =>
      segment
        .replace(/\{|\}/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
    )
    .filter((segment) => segment.length > 0)
    .join("-")
}
