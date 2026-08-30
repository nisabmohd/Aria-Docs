/** Error thrown when an OpenAPI document cannot be parsed or fails validation. */
export class OpenAPIParseError extends Error {
  readonly issues: ValidationIssue[]

  constructor(message: string, issues: ValidationIssue[] = []) {
    super(message)
    this.name = "OpenAPIParseError"
    this.issues = issues
  }
}

export interface ValidationIssue {
  /** JSON-pointer-ish path to the offending node, e.g. `/info/title`. */
  path: string
  message: string
}
