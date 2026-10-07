import type { NavItem } from "@ariadocs/core"
import type { ParseOpenAPIOptions } from "./options.js"
import { parseOpenAPI } from "./parse.js"
import type { APIOperation, APISchema, APISearchResult, APISpec } from "./types/index.js"
import { getOperation, getSchema } from "./utils/lookup.js"
import { getNavigation, getPagePaths, type GetNavigationOptions } from "./utils/navigation.js"
import { search, type SearchOptions } from "./utils/search.js"

/** Configuration for `createOpenAPI`: the parse options, set once. */
export type OpenAPIConfig = ParseOpenAPIOptions

/** The object returned by `createOpenAPI`. */
export interface OpenAPIInstance {
  /** Parse the document. The result is cached; failures are not, so a retry re-reads the source. */
  parse: () => Promise<APISpec>
  /** Sidebar navigation (`NavItem[]`, same shape as `@ariadocs/mdx`). */
  getNavigation: (options?: GetNavigationOptions) => Promise<NavItem[]>
  /** Every operation page path, e.g. `["/listPets"]`, for static generation. */
  getPagePaths: () => Promise<string[]>
  /** Find an operation by id. */
  getOperation: (id: string) => Promise<APIOperation | undefined>
  /** Find a component schema by name. */
  getSchema: (name: string) => Promise<APISchema | undefined>
  /** Search operations, schemas and tags. */
  search: (query: string, options?: SearchOptions) => Promise<APISearchResult[]>
  /** Drop the cached result so the next call parses the source again. */
  reload: () => void
  /** The config this instance was created with. */
  readonly config: OpenAPIConfig
}

/**
 * Create an OpenAPI instance with its options set once — the OpenAPI
 * counterpart of `createDocs` in `@ariadocs/mdx`.
 *
 * ```ts
 * export const openapi = createOpenAPI({ source: "./openapi.yaml" });
 *
 * const api = await openapi.parse();
 * const nav = await openapi.getNavigation({ getOperationHref: (op) => `/api/${op.id}` });
 * ```
 */
export function createOpenAPI(config: OpenAPIConfig): OpenAPIInstance {
  let cached: Promise<APISpec> | undefined

  const parse = (): Promise<APISpec> => {
    if (cached === undefined) {
      const pending = parseOpenAPI(config)
      cached = pending
      pending.catch(() => {
        if (cached === pending) cached = undefined
      })
    }
    return cached
  }

  return {
    parse,
    getNavigation: async (options) => getNavigation(await parse(), options),
    getPagePaths: async () => getPagePaths(await parse()),
    getOperation: async (id) => getOperation(await parse(), id),
    getSchema: async (name) => getSchema(await parse(), name),
    search: async (query, options) => search(await parse(), query, options),
    reload: () => {
      cached = undefined
    },
    get config() {
      return config
    },
  }
}
