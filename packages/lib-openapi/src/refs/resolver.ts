import { setOwn } from "@ariadocs/core"
import { OpenAPIError } from "../errors.js"
import { DEFAULT_MAX_DEPTH } from "../options.js"
import type { OpenAPIDocument } from "../types/index.js"
import { isLocalRef, isRefObject, resolvePointer } from "./pointer.js"

export interface ResolveResult {
  document: OpenAPIDocument
  /** Non-fatal issues found while resolving (external or missing refs). */
  warnings: string[]
}

export interface ResolveOptions {
  /** Maximum object nesting depth before an `OpenAPIError` is thrown (default `500`). */
  maxDepth?: number
}

interface ResolveState {
  root: OpenAPIDocument
  keepRef: boolean
  maxDepth: number
  warnings: string[]
  /** Refs currently being expanded; meeting one again means a cycle. */
  stack: Set<string>
  /** Raw objects on the current walk path (catches refs to an enclosing object). */
  ancestors: Set<object>
  /**
   * Each pointer is expanded once and the result reused. Without this, a
   * document where A uses B twice, B uses C twice, and so on, would take
   * exponential time and memory.
   */
  cache: Map<string, unknown>
  /** Warn once per pointer, not once per use. */
  warned: Set<string>
}

/**
 * Resolve local `$ref` pointers across a document.
 *
 * - Every `{ $ref: "#/..." }` is replaced with the target's content, and the
 *   result keeps its origin in `ref`.
 * - Recursive references stay as raw `{ $ref }` objects instead of
 *   expanding forever.
 * - External references are left as they are and reported as warnings.
 * - The input document is never mutated.
 */
export function resolveRefs(document: OpenAPIDocument, options: ResolveOptions = {}): ResolveResult {
  return run(document, true, options)
}

/**
 * Like `resolveRefs`, but no `ref` markers are kept. Recursive references
 * are still left as raw `{ $ref }` objects.
 */
export function dereference(document: OpenAPIDocument, options: ResolveOptions = {}): ResolveResult {
  return run(document, false, options)
}

function run(document: OpenAPIDocument, keepRef: boolean, options: ResolveOptions): ResolveResult {
  const state: ResolveState = {
    root: document,
    keepRef,
    maxDepth: options.maxDepth ?? DEFAULT_MAX_DEPTH,
    warnings: [],
    stack: new Set(),
    ancestors: new Set(),
    cache: new Map(),
    warned: new Set(),
  }
  const resolved = walk(document, state, 0)
  return { document: resolved as OpenAPIDocument, warnings: state.warnings }
}

function walk(value: unknown, state: ResolveState, depth: number): unknown {
  if (typeof value !== "object" || value === null) {
    return value
  }

  if (depth > state.maxDepth) {
    throw new OpenAPIError(
      `OpenAPI document is nested deeper than ${state.maxDepth} levels (maxDepth).`,
      "OPENAPI_TOO_DEEP"
    )
  }

  if (Array.isArray(value)) {
    return value.map((item) => walk(item, state, depth + 1))
  }

  if (isRefObject(value)) {
    return resolveRef(value, state, depth)
  }

  state.ancestors.add(value)
  const output: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value)) {
    setOwn(output, key, walk(child, state, depth + 1))
  }
  state.ancestors.delete(value)
  return output
}

function resolveRef(refObject: Record<string, unknown>, state: ResolveState, depth: number): unknown {
  const ref = refObject.$ref as string

  if (!isLocalRef(ref)) {
    warnOnce(
      state,
      ref,
      `External $ref "${ref}" was not resolved. External refs are not supported; the reference was left as-is.`
    )
    return { ...refObject }
  }

  if (state.stack.has(ref)) {
    return { $ref: ref }
  }

  let resolved: unknown
  if (state.cache.has(ref)) {
    resolved = state.cache.get(ref)
  } else {
    const target = resolvePointer(state.root, ref)

    if (target === undefined) {
      warnOnce(state, ref, `$ref "${ref}" could not be resolved: target not found.`)
      return { ...refObject }
    }

    // The target encloses this reference: a recursive schema.
    if (typeof target === "object" && target !== null && state.ancestors.has(target)) {
      return { $ref: ref }
    }

    state.stack.add(ref)
    try {
      resolved = walk(target, state, depth + 1)
    } finally {
      state.stack.delete(ref)
    }
    state.cache.set(ref, resolved)
  }

  if (typeof resolved !== "object" || resolved === null || Array.isArray(resolved)) {
    return resolved
  }

  // OpenAPI 3.1 allows keywords next to $ref (e.g. `description`); they win.
  const merged: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(resolved)) setOwn(merged, key, val)
  for (const [key, val] of Object.entries(refObject)) {
    if (key !== "$ref") setOwn(merged, key, walk(val, state, depth + 1))
  }
  if (state.keepRef) {
    merged.ref = ref
  }
  return merged
}

function warnOnce(state: ResolveState, ref: string, message: string): void {
  if (state.warned.has(ref)) return
  state.warned.add(ref)
  state.warnings.push(message)
}
