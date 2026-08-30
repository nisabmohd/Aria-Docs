import type { AriadocsOpenAPI, OpenAPIDocument } from "../types/index.js"
import { normalizeDocument } from "../normalize/document.js"
import { dereference, resolveRefs } from "../refs/resolver.js"
import { OpenAPIParseError } from "../validation/errors.js"
import { validate as validateDocument } from "../validation/validate.js"
import { loadInput, type OpenAPIInput } from "./input.js"
import { defaultParseOptions, type ParseOptions } from "./options.js"

/**
 * Parse an OpenAPI document (3.0/3.1, JSON or YAML) into the normalized
 * `AriadocsOpenAPI` model.
 *
 * ```ts
 * import { openapi } from "@ariadocs/openapi";
 *
 * const api = await openapi.parse(spec);
 * api.operations[0].responses[0].isSuccess; // true
 * ```
 */
export async function parse(
  input: OpenAPIInput,
  options: ParseOptions = {}
): Promise<AriadocsOpenAPI> {
  const opts: ParseOptions = { ...defaultParseOptions, ...options }

  const { document } = await loadInput(input)

  if (opts.validate) {
    const result = validateDocument(document)
    if (!result.valid) {
      const details = result.errors
        .map((error) => `  - ${error.path === "" ? "(root)" : error.path}: ${error.message}`)
        .join("\n")
      throw new OpenAPIParseError(
        `Invalid OpenAPI document:\n${details}`,
        result.errors
      )
    }
  }

  let resolved: OpenAPIDocument = document
  let warnings: string[] = []

  if (opts.dereference) {
    const result = dereference(document)
    resolved = result.document
    warnings = result.warnings
  } else if (opts.resolveRefs) {
    const result = resolveRefs(document)
    resolved = result.document
    warnings = result.warnings
  }

  if (opts.strict && warnings.length > 0) {
    throw new OpenAPIParseError(
      `Strict mode: OpenAPI document has unresolved references:\n${warnings.map((w) => `  - ${w}`).join("\n")}`
    )
  }

  return normalizeDocument(resolved, { includeRaw: opts.includeRaw })
}
