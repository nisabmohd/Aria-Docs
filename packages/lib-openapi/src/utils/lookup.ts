import { getOwn } from "@ariadocs/core"
import type { APIOperation, APISchema, APISpec } from "../types/index.js"

/** Find an operation by its `id` (or original `operationId`). */
export function getOperation(api: APISpec, id: string): APIOperation | undefined {
  return (
    api.operations.find((operation) => operation.id === id) ??
    api.operations.find((operation) => operation.operationId === id)
  )
}

/** Find a component schema by name. Inherited keys such as `"constructor"` never match. */
export function getSchema(api: APISpec, name: string): APISchema | undefined {
  return getOwn(api.schemas, name)
}
