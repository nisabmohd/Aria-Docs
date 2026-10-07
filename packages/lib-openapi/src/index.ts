// ---------- Factory ----------
export { createOpenAPI, type OpenAPIConfig, type OpenAPIInstance } from "./create.js"

// ---------- Parsing ----------
export { parseOpenAPI } from "./parse.js"
export { loadOpenAPI } from "./load/load.js"
export { validateOpenAPI, type ValidationResult } from "./validation/validate.js"
export { resolveRefs, dereference, type ResolveOptions, type ResolveResult } from "./refs/resolver.js"
export { normalizeOpenAPI, DEFAULT_TAG, type NormalizeOptions } from "./normalize/document.js"
export type { OpenAPISource, LoadOpenAPIOptions, ParseOpenAPIOptions } from "./options.js"
export { OpenAPIError, type OpenAPIErrorCode, type ValidationIssue } from "./errors.js"

// ---------- Model helpers ----------
export { getNavigation, getPagePaths, getOperationTitle, type GetNavigationOptions } from "./utils/navigation.js"
export { getOperation, getSchema } from "./utils/lookup.js"
export { search, searchOperations, searchSchemas, searchTags, type SearchOptions } from "./utils/search.js"
export { getPrimaryResponse, getSuccessResponses, getErrorResponses } from "./utils/responses.js"
export { getServerUrl } from "./utils/server-url.js"
export { createOperationId, type OperationIdInput } from "./utils/operation-id.js"
export {
  createRequestSample,
  getContentExample,
  type APIRequestSample,
  type CreateRequestSampleOptions,
} from "./utils/request-sample.js"
export { createCodeSample, CODE_SAMPLE_LANGUAGES, type CodeSampleLanguage } from "./utils/code-sample.js"

// ---------- Schema helpers ----------
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
  getSchemaTypeLabel,
  getSchemaName,
  getSchemaProperties,
  getSchemaExample,
  resolveSchema,
  generateSchemaExample,
  type GenerateExampleOptions,
} from "./normalize/schema.js"

// ---------- Types ----------
export type { NavItem } from "@ariadocs/core"
export type {
  OpenAPIDocument,
  APISpec,
  APIInfo,
  APIServer,
  APIServerVariable,
  APITag,
  APIWebhook,
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
