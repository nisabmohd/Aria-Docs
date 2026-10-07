import type { APIOperation, APISearchResult, APISpec } from "../types/index.js"
import { getOperationTitle } from "./navigation.js"

export interface SearchOptions {
  /** Maximum number of results (default `50`). */
  limit?: number
}

/** Case-insensitive search across operations, schemas and tags. Every word must match. */
export function search(api: APISpec, query: string, options: SearchOptions = {}): APISearchResult[] {
  return [
    ...searchOperations(api, query),
    ...searchSchemas(api, query),
    ...searchTags(api, query),
  ].slice(0, options.limit ?? 50)
}

export function searchOperations(api: APISpec, query: string): APISearchResult[] {
  const terms = tokenize(query)
  if (terms.length === 0) return []

  return api.operations
    .filter((operation) => matches(operationHaystack(operation), terms))
    .map((operation) => ({
      type: "operation" as const,
      id: operation.id,
      title: getOperationTitle(operation),
      subtitle: `${operation.method} ${operation.path}`,
    }))
}

export function searchSchemas(api: APISpec, query: string): APISearchResult[] {
  const terms = tokenize(query)
  if (terms.length === 0) return []

  return Object.entries(api.schemas)
    .filter(([name, schema]) => matches([name, schema.title, schema.description], terms))
    .map(([name, schema]) => ({
      type: "schema" as const,
      id: name,
      title: schema.title ?? name,
      subtitle: "Schema",
    }))
}

export function searchTags(api: APISpec, query: string): APISearchResult[] {
  const terms = tokenize(query)
  if (terms.length === 0) return []

  return api.tags
    .filter((tag) => matches([tag.name, tag.title, tag.description], terms))
    .map((tag) => ({
      type: "tag" as const,
      id: tag.id,
      title: tag.title,
      subtitle: "Tag",
    }))
}

function operationHaystack(operation: APIOperation): (string | undefined)[] {
  return [
    operation.summary,
    operation.description,
    operation.operationId,
    operation.id,
    `${operation.method} ${operation.path}`,
    ...operation.tags,
  ]
}

function matches(haystack: (string | undefined)[], terms: string[]): boolean {
  const text = haystack.filter((value) => typeof value === "string").join(" ").toLowerCase()
  return terms.every((term) => text.includes(term))
}

function tokenize(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter((term) => term !== "").slice(0, 16)
}
