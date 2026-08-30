import { parse } from "./parser/parse.js"
import { loadInput, type OpenAPIInput } from "./parser/input.js"
import { resolveRefs } from "./refs/resolver.js"
import { validate as validateDocument } from "./validation/validate.js"
import { search as searchAll } from "./utils/search.js"
import { getNavigation } from "./utils/navigation.js"

export type { ParseOptions } from "./parser/options.js"
export type { OpenAPIInput, LoadedInput } from "./parser/input.js"
export { loadInput } from "./parser/input.js"
export { OpenAPIParseError, type ValidationIssue } from "./validation/errors.js"
export { validateDocument }
export { resolveRefs, dereference } from "./refs/resolver.js"
export { createOperationId } from "./utils/operation-id.js"
export {
  getPrimaryResponse,
  getSuccessResponses,
  getErrorResponses,
} from "./utils/responses.js"
export { getNavigation, operationTitle } from "./utils/navigation.js"
export {
  search,
  searchOperations,
  searchSchemas,
  searchTags,
} from "./utils/search.js"
export {
  isObjectSchema,
  isArraySchema,
  isStringSchema,
  isNumberSchema,
  isBooleanSchema,
  isEnumSchema,
  isNullableSchema,
  isReferenceSchema,
  getSchemaType,
  getSchemaProperties,
  getSchemaExample,
  resolveSchema,
  generateSchemaExample,
} from "./normalize/schema.js"
export { normalizeDocument } from "./normalize/document.js"

export type {
  OpenAPIDocument,
  AriadocsOpenAPI,
  APIInfo,
  APIServer,
  APIServerVariable,
  APITag,
  APIOperationGroup,
  APIWebhook,
  APINavigation,
  APINavigationGroup,
  APINavigationItem,
  APISearchResult,
  APISearchResultType,
  HTTPMethod,
  ParameterLocation,
  ExternalDocs,
  APIExample,
  APIContent,
  APIParameter,
  APIRequestBody,
  APIHeader,
  APILink,
  APIResponse,
  APICallback,
  APIOperation,
  SecuritySchemeType,
  APIKeyLocation,
  APIOAuthFlow,
  APISecurityScheme,
  APISecurityRequirement,
  APISchema,
  APISchemaDiscriminator,
  APISchemaProperty,
} from "./types/index.js"

/**
 * The `@ariadocs/openapi` namespace.
 *
 * ```ts
 * import { openapi } from "@ariadocs/openapi";
 *
 * const api = await openapi.parse("./openapi.yaml");
 * const nav = openapi.navigation(api);
 * const results = openapi.search(api, "planet");
 * ```
 */
export const openapi = {
  /** Parse an OpenAPI document (object, JSON/YAML text, file path or URL) into the normalized model. */
  parse,

  /** Load + structurally validate an OpenAPI document without normalizing it. */
  async validate(input: OpenAPIInput) {
    const { document } = await loadInput(input)
    return validateDocument(document)
  },

  /** Load an OpenAPI document and resolve its local `$ref` pointers. */
  async resolve(input: OpenAPIInput) {
    const { document } = await loadInput(input)
    return resolveRefs(document).document
  },

  /** Search operations, schemas and tags in a parsed model. */
  search: searchAll,

  /** Build sidebar-ready navigation from a parsed model. */
  navigation: getNavigation,
}
