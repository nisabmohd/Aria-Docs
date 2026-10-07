import { OpenAPIError } from "./errors.js"
import { loadOpenAPI } from "./load/load.js"
import { normalizeOpenAPI } from "./normalize/document.js"
import { DEFAULT_MAX_DEPTH, type ParseOpenAPIOptions } from "./options.js"
import { dereference, resolveRefs } from "./refs/resolver.js"
import type { APISpec, OpenAPIDocument } from "./types/index.js"
import { validateOpenAPI } from "./validation/validate.js"

/**
 * Load, validate, resolve and normalize an OpenAPI 3.x document.
 *
 * ```ts
 * import { parseOpenAPI } from "@ariadocs/openapi";
 *
 * const api = await parseOpenAPI({ source: "./openapi.yaml" });
 * api.operations[0].responses[0].isSuccess; // true
 * ```
 *
 * Works on the server and in the browser. In the browser, `source` must be a
 * document object, JSON/YAML text or an http(s) URL.
 */
export async function parseOpenAPI(options: ParseOpenAPIOptions): Promise<APISpec> {
  const document = await loadOpenAPI(options)

  if (options.validate !== false) {
    const result = validateOpenAPI(document)
    if (!result.valid) {
      const details = result.errors
        .map((error) => `  - ${error.path === "" ? "(root)" : error.path}: ${error.message}`)
        .join("\n")
      throw new OpenAPIError(`Invalid OpenAPI document:\n${details}`, "OPENAPI_INVALID", {
        issues: result.errors,
      })
    }
  }

  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH
  let resolved: OpenAPIDocument = document
  let warnings: string[] = []

  if (options.dereference === true) {
    ;({ document: resolved, warnings } = dereference(document, { maxDepth }))
  } else if (options.resolveRefs !== false) {
    ;({ document: resolved, warnings } = resolveRefs(document, { maxDepth }))
  }

  if (options.strict === true && warnings.length > 0) {
    throw new OpenAPIError(
      `Strict mode: the OpenAPI document has unresolved references:\n${warnings.map((w) => `  - ${w}`).join("\n")}`,
      "OPENAPI_UNRESOLVED_REF"
    )
  }

  return normalizeOpenAPI(resolved, { includeRaw: options.includeRaw, warnings })
}
