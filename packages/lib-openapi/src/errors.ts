import { AriadocsError } from "@ariadocs/core"

export interface ValidationIssue {
  /** JSON pointer to the offending node, e.g. `/info/title`. */
  path: string
  message: string
}

export type OpenAPIErrorCode =
  | "OPENAPI_LOAD_ERROR"
  | "OPENAPI_SYNTAX_ERROR"
  | "OPENAPI_INVALID"
  | "OPENAPI_UNRESOLVED_REF"
  | "OPENAPI_TOO_LARGE"
  | "OPENAPI_TOO_DEEP"

/** Thrown when an OpenAPI document cannot be loaded, parsed or validated. */
export class OpenAPIError extends AriadocsError {
  declare readonly code: OpenAPIErrorCode
  /** Validation issues, when the error came from validation. */
  readonly issues: ValidationIssue[]

  constructor(
    message: string,
    code: OpenAPIErrorCode,
    options: { issues?: ValidationIssue[]; cause?: unknown } = {}
  ) {
    super(message, code, { cause: options.cause })
    this.name = "OpenAPIError"
    this.issues = options.issues ?? []
  }
}
