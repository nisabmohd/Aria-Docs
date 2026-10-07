import { AriadocsError } from "@ariadocs/core"

export type MdxErrorCode = "MDX_NOT_FOUND" | "MDX_INVALID_SLUG" | "MDX_INVALID_META" | "MDX_COMPILE_ERROR"

/**
 * Thrown by `@ariadocs/mdx` for missing pages, unsafe slugs and MDX that fails to compile. Check
 * `code === "MDX_NOT_FOUND"` (or `isMdxNotFound(error)`) to render a 404.
 */
export class MdxError extends AriadocsError {
  declare readonly code: MdxErrorCode

  constructor(message: string, code: MdxErrorCode, options?: { cause?: unknown }) {
    super(message, code, options)
    this.name = "MdxError"
  }
}

/** True when a page doesn't exist or its slug was rejected — both mean "404". */
export function isMdxNotFound(error: unknown): boolean {
  return error instanceof MdxError && (error.code === "MDX_NOT_FOUND" || error.code === "MDX_INVALID_SLUG")
}
