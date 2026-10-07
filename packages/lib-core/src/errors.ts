/**
 * Base class for every error thrown by Ariadocs packages. Catch this to
 * handle any Ariadocs failure, or check `code` for the specific case.
 */
export class AriadocsError extends Error {
  readonly code: string

  constructor(message: string, code = "ARIADOCS_ERROR", options?: { cause?: unknown }) {
    super(message, options)
    this.name = "AriadocsError"
    this.code = code
  }
}

/** True for errors thrown by Ariadocs packages. */
export function isAriadocsError(error: unknown): error is AriadocsError {
  return error instanceof AriadocsError
}
