import { isScalar, parseDocument } from "yaml"
import { OpenAPIError } from "../errors.js"

/**
 * Parse JSON or YAML text into a plain value.
 *
 * Error messages never echo document content: JSON engines and the YAML
 * parser both quote the offending source, which would leak data when the
 * text came from a file the caller did not expect to be read.
 */
export function parseText(text: string, label?: string): unknown {
  const where = label !== undefined ? ` in ${label}` : ""
  const trimmed = text.replace(/^\uFEFF/, "").trim()

  if (trimmed === "") {
    throw new OpenAPIError(`OpenAPI document${where} is empty.`, "OPENAPI_SYNTAX_ERROR")
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed) as unknown
    } catch (error) {
      const position = /position (\d+)/.exec((error as Error).message)?.[1]
      throw new OpenAPIError(
        `Invalid JSON${where}${position !== undefined ? ` at position ${position}` : ""}.`,
        "OPENAPI_SYNTAX_ERROR",
        { cause: error }
      )
    }
  }

  const document = parseDocument(trimmed, {
    merge: true,
    prettyErrors: false,
  })

  const [error] = document.errors
  if (error !== undefined) {
    const line = error.linePos?.[0]
    throw new OpenAPIError(
      `Invalid YAML${where}${line !== undefined ? ` at line ${line.line}, column ${line.col}` : ""}: ${firstLine(error.message)}`,
      "OPENAPI_SYNTAX_ERROR",
      { cause: error }
    )
  }

  let value: unknown
  try {
    // Bound alias expansion ("billion laughs").
    value = document.toJS({ maxAliasCount: 100 })
  } catch (cause) {
    throw new OpenAPIError(
      `Invalid YAML${where}: ${firstLine((cause as Error).message)}`,
      "OPENAPI_SYNTAX_ERROR",
      { cause }
    )
  }

  // YAML turns unquoted `version: 1.0` into the number 1. Restore the
  // version strings exactly as written.
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>
    const openapi = sourceOf(document.get("openapi", true), trimmed)
    if (typeof record.openapi === "number" && openapi !== undefined) record.openapi = openapi

    const info = record.info as Record<string, unknown> | undefined
    const version = sourceOf(document.getIn(["info", "version"], true), trimmed)
    if (typeof info === "object" && info !== null && typeof info.version === "number" && version !== undefined) {
      info.version = version
    }
  }

  return value
}

function sourceOf(node: unknown, text: string): string | undefined {
  if (!isScalar(node) || node.range === undefined || node.range === null) return undefined
  return text.slice(node.range[0], node.range[1]).trim()
}

function firstLine(message: string): string {
  return message.split("\n")[0]?.replace(/:$/, "") ?? message
}
