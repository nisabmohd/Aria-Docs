export interface ParseOptions {
  /**
   * Resolve local `$ref` pointers before normalization (default `true`).
   * Resolved schemas keep their original pointer in `schema.ref`.
   */
  resolveRefs?: boolean
  /**
   * Fully dereference the document: refs are replaced with their resolved
   * content and no `ref` marker is kept (default `false`). Recursive
   * references are still protected against infinite expansion.
   */
  dereference?: boolean
  /**
   * Run structural validation and throw `OpenAPIParseError` when the document
   * is unusable (default `true`).
   */
  validate?: boolean
  /** Base URL for resolving relative references (reserved for external refs). */
  baseUrl?: string
  /**
   * Follow external `$ref` pointers (default `false`). Not supported yet —
   * external refs are left as-is with a warning.
   */
  externalRefs?: boolean
  /**
   * Throw on warnings (unresolved refs, unsupported versions) instead of
   * continuing (default `false`).
   */
  strict?: boolean
  /**
   * Keep the raw document on `api.raw` and raw operations on
   * `operation.raw` (default `false`).
   */
  includeRaw?: boolean
}

export const defaultParseOptions: ParseOptions = {
  resolveRefs: true,
  dereference: false,
  validate: true,
  baseUrl: undefined,
  externalRefs: false,
  strict: false,
  includeRaw: false,
}
