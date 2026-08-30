import type { APIOperation, APIResponse } from "../types/index.js"

/** The response a UI should show first: first 2xx, else the lowest status, else "default". */
export function getPrimaryResponse(operation: APIOperation): APIResponse | undefined {
  if (operation.responses.length === 0) return undefined
  const success = operation.responses.find((response) => response.isSuccess)
  if (success !== undefined) return success
  return operation.responses[0]
}

export function getSuccessResponses(operation: APIOperation): APIResponse[] {
  return operation.responses.filter((response) => response.isSuccess)
}

export function getErrorResponses(operation: APIOperation): APIResponse[] {
  return operation.responses.filter((response) => response.isError)
}
