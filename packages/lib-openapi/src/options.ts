import type { OpenAPIDocument } from "./types/index.js"

/**
 * Where an OpenAPI document comes from:
 *
 * - an already-parsed document object,
 * - raw JSON or YAML text,
 * - an `http(s)://` URL (string or `URL`),
 * - a local file path or `file:` URL (Node.js, Bun and Deno only).
 */
export type OpenAPISource = OpenAPIDocument | string | URL

export interface LoadOpenAPIOptions {
  /** The document, its text, a URL or a file path. */
  source: OpenAPISource
  /**
   * Allow reading local files (default `true`). Set to `false` when `source`
   * may come from an untrusted user, otherwise a path such as `/etc/passwd`
   * would be read from disk.
   */
  allowFiles?: boolean
  /**
   * Allow fetching remote URLs (default `true`). Set to `false` when `source`
   * may come from an untrusted user to rule out SSRF.
   */
  allowRemote?: boolean
  /** Custom `fetch` implementation (defaults to the global `fetch`). */
  fetch?: typeof fetch
  /** Extra request headers for remote documents, e.g. an `Authorization` header. */
  headers?: Record<string, string>
  /** Remote request timeout in milliseconds (default `30_000`). */
  timeout?: number
  /** Maximum document size in bytes for files and remote documents (default 20 MB). */
  maxSize?: number
}

export interface ParseOpenAPIOptions extends LoadOpenAPIOptions {
  /**
   * Resolve local `$ref` pointers (default `true`). Resolved objects keep their
   * origin pointer in `ref`, e.g. `schema.ref === "#/components/schemas/User"`.
   */
  resolveRefs?: boolean
  /**
   * Inline references without keeping `ref` markers (default `false`).
   * Recursive references are still kept finite.
   */
  dereference?: boolean
  /** Validate the document structure and throw `OpenAPIError` on errors (default `true`). */
  validate?: boolean
  /** Throw on warnings such as unresolved references (default `false`). */
  strict?: boolean
  /** Keep the raw document on `api.raw` and raw operations on `operation.raw` (default `false`). */
  includeRaw?: boolean
  /**
   * Maximum object nesting depth (default `500`). Deeper documents are
   * rejected instead of overflowing the call stack.
   */
  maxDepth?: number
}

export const DEFAULT_TIMEOUT = 30_000
export const DEFAULT_MAX_SIZE = 20 * 1024 * 1024
export const DEFAULT_MAX_DEPTH = 500
