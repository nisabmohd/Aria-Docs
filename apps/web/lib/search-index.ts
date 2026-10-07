import type { NavItem } from "@ariadocs/core"
import { getOperationTitle } from "@ariadocs/openapi"
import { getSidebar } from "./navigation"
import { openapi, REFERENCE_BASE } from "./source"

export interface SearchEntry {
  title: string
  href: string
  section: string
  /** Parent folder or, for endpoints, the path. */
  group?: string
  badge?: string
  keywords?: string
}

function collect(items: NavItem[], section: string, group?: string): SearchEntry[] {
  return items.flatMap((item) => {
    if (!item.nav) return []
    if (item.items.length > 0) return collect(item.items, section, item.title)
    if (item.badge !== undefined) return [] // endpoints are added below with richer data
    return [{ title: item.title, href: item.href, section, group }]
  })
}

/** Built at build time (every route is static) and handed to the client search dialog. */
export async function getSearchIndex(): Promise<SearchEntry[]> {
  const [sidebar, api] = await Promise.all([getSidebar(), openapi.parse()])

  return [
    ...sidebar.flatMap((section) => collect(section.items, section.title)),
    ...api.operations.map((operation) => ({
      title: getOperationTitle(operation),
      href: `${REFERENCE_BASE}/${operation.id}`,
      section: "API Reference",
      group: `${operation.method} ${operation.path}`,
      badge: operation.method,
      keywords: [operation.operationId, ...operation.tags].join(" "),
    })),
  ]
}
