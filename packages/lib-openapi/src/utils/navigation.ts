import type { NavItem } from "@ariadocs/core"
import type { APIOperation, APISpec, APITag } from "../types/index.js"

export interface GetNavigationOptions {
  /** Link for an operation (default `#${operation.id}`). */
  getOperationHref?: (operation: APIOperation) => string
  /** Link for a tag group (default `#${tag.id}`). */
  getTagHref?: (tag: APITag) => string
}

/**
 * Sidebar navigation: one item per tag, each with its operations as
 * children. Operations carry their HTTP method as `badge`.
 *
 * Returns the same `NavItem` shape as `@ariadocs/mdx`'s `getNavigation`, so
 * one sidebar component can render both.
 */
export function getNavigation(api: APISpec, options: GetNavigationOptions = {}): NavItem[] {
  const operationHref = options.getOperationHref ?? ((operation) => `#${operation.id}`)
  const tagHref = options.getTagHref ?? ((tag) => `#${tag.id}`)

  return api.tags.map((tag) => ({
    title: tag.title,
    href: tagHref(tag),
    nav: true,
    props: {},
    items: tag.operations.map((operation) => ({
      title: getOperationTitle(operation),
      href: operationHref(operation),
      nav: true,
      props: {},
      items: [],
      badge: operation.method,
    })),
  }))
}

/** Every operation page path, e.g. `["/listPets", "/get-pets-id"]`, for static generation. */
export function getPagePaths(api: APISpec): string[] {
  return api.operations.map((operation) => `/${operation.id}`)
}

/** `summary`, falling back to `"GET /pets"`. */
export function getOperationTitle(operation: APIOperation): string {
  return operation.summary ?? `${operation.method} ${operation.path}`
}
