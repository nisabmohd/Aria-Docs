import type {
  APISearchResult,
  AriadocsOpenAPI,
  APIOperation,
} from "../types/index.js"

const MAX_RESULTS = 50

/** Search operations, schemas and tags by query (case-insensitive substring). */
export function search(api: AriadocsOpenAPI, query: string): APISearchResult[] {
  return [
    ...searchOperations(api, query),
    ...searchSchemas(api, query),
    ...searchTags(api, query),
  ].slice(0, MAX_RESULTS)
}

export function searchOperations(api: AriadocsOpenAPI, query: string): APISearchResult[] {
  const terms = normalize(query)
  if (terms === "") return []

  return api.operations
    .filter((operation) => matchesOperation(operation, terms))
    .map((operation) => ({
      type: "operation" as const,
      id: operation.id,
      title: operation.summary ?? `${operation.method} ${operation.path}`,
      subtitle: `${operation.method} ${operation.path}`,
    }))
}

export function searchSchemas(api: AriadocsOpenAPI, query: string): APISearchResult[] {
  const terms = normalize(query)
  if (terms === "") return []

  return Object.entries(api.schemas)
    .filter(([name, schema]) => {
      if (name.toLowerCase().includes(terms)) return true
      if (schema.title !== undefined && schema.title.toLowerCase().includes(terms)) return true
      if (schema.description !== undefined && schema.description.toLowerCase().includes(terms)) return true
      return false
    })
    .map(([name, schema]) => ({
      type: "schema" as const,
      id: name,
      title: schema.title ?? name,
      subtitle: "Schema",
    }))
}

export function searchTags(api: AriadocsOpenAPI, query: string): APISearchResult[] {
  const terms = normalize(query)
  if (terms === "") return []

  return api.tags
    .filter((tag) => {
      if (tag.name.toLowerCase().includes(terms)) return true
      if (tag.description !== undefined && tag.description.toLowerCase().includes(terms)) return true
      return false
    })
    .map((tag) => ({
      type: "tag" as const,
      id: tag.name,
      title: tag.name,
      subtitle: "Tag",
    }))
}

function matchesOperation(operation: APIOperation, terms: string): boolean {
  const haystacks = [
    operation.summary,
    operation.description,
    operation.operationId,
    operation.id,
    `${operation.method} ${operation.path}`,
    operation.path,
    ...operation.tags,
  ]
  return haystacks.some(
    (value) => typeof value === "string" && value.toLowerCase().includes(terms)
  )
}

function normalize(query: string): string {
  return query.trim().toLowerCase()
}
