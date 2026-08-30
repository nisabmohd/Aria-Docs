import type { APINavigation, AriadocsOpenAPI } from "../types/index.js"

/**
 * Build sidebar-ready navigation from an API model:
 * `{ groups: [{ id, title, items: [{ id, title, method, path }] }] }`.
 */
export function getNavigation(api: AriadocsOpenAPI): APINavigation {
  return {
    groups: api.groups.map((group) => ({
      id: group.id,
      title: group.name,
      items: group.operations.map((operation) => ({
        id: operation.id,
        title: operationTitle(operation),
        method: operation.method,
        path: operation.path,
      })),
    })),
  }
}

export function operationTitle(
  operation: AriadocsOpenAPI["operations"][number]
): string {
  return operation.summary ?? `${operation.method} ${operation.path}`
}
