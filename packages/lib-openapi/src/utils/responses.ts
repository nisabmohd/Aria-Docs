import type { APIOperation, APIResponse } from "../types/index.js"

/** The response to show first: the first 2xx, else the first response (lowest status). */
export function getPrimaryResponse(operation: APIOperation): APIResponse | undefined {
  return operation.responses.find((response) => response.isSuccess) ?? operation.responses[0]
}

export function getSuccessResponses(operation: APIOperation): APIResponse[] {
  return operation.responses.filter((response) => response.isSuccess)
}

export function getErrorResponses(operation: APIOperation): APIResponse[] {
  return operation.responses.filter((response) => response.isError)
}
