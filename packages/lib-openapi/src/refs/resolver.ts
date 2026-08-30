import type { OpenAPIDocument } from "../types/index.js"
import { isLocalRef, isRefObject, resolvePointer } from "./pointer.js"

export interface ResolveResult {
  document: OpenAPIDocument
  /** Non-fatal issues encountered while resolving (e.g. external refs left as-is). */
  warnings: string[]
}

interface ResolveState {
  /** The document refs are resolved against. */
  root: OpenAPIDocument
  /** Pointers currently being resolved on the walk stack — used for cycle detection. */
  stack: Set<string>
  warnings: string[]
  /** Keep the original pointer on every resolved object (`ref` marker). */
  keepRef: boolean
}

/**
 * Resolve local `$ref` pointers across a document.
 *
 * - Every `{$ref: "#/..."}` is replaced with the resolved target's content.
 * - The resolved object also carries `ref: "#/..."` so consumers always know
 *   the origin (`schema.ref`).
 * - Recursive schemas (e.g. `friend: { $ref: "#/components/schemas/User" }`
 *   inside `User`) are detected and the inner reference is left untouched
 *   instead of expanding into infinite objects.
 * - External refs (`./schemas/user.yaml#/User`) are never followed here; they
 *   are left as-is and reported as warnings.
 */
export function resolveRefs(document: OpenAPIDocument): ResolveResult {
  return run(document, { keepRef: true })
}

/**
 * Fully dereference a document: references are replaced with their resolved
 * content and no `ref` marker is kept. Cycles are still protected against —
 * references that would recurse forever are left as raw `{$ref}` objects.
 */
export function dereference(document: OpenAPIDocument): ResolveResult {
  return run(document, { keepRef: false })
}

function run(document: OpenAPIDocument, options: { keepRef: boolean }): ResolveResult {
  const state: ResolveState = {
    root: document,
    stack: new Set<string>(),
    warnings: [],
    keepRef: options.keepRef,
  }
  const resolved = walk(document, state, new Set())
  return { document: resolved as OpenAPIDocument, warnings: state.warnings }
}

/**
 * Walk a value, resolving every `{$ref}` encountered.
 *
 * `ancestors` holds the identities of raw objects on the current walk path.
 * A reference whose target is one of those ancestors points back up the tree
 * (a recursive schema) and is kept as a raw `{$ref}` instead of expanding.
 */
function walk(value: unknown, state: ResolveState, ancestors: Set<object>): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => walk(item, state, ancestors))
  }

  if (typeof value !== "object" || value === null) {
    return value
  }

  const record = value as Record<string, unknown>

  if (isRefObject(record)) {
    return resolveRefObject(record, state, ancestors)
  }

  ancestors.add(record)
  const output: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(record)) {
    output[key] = walk(child, state, ancestors)
  }
  ancestors.delete(record)
  return output
}

function resolveRefObject(
  refObject: Record<string, unknown>,
  state: ResolveState,
  ancestors: Set<object>
): unknown {
  const ref = refObject.$ref as string

  if (!isLocalRef(ref)) {
    state.warnings.push(
      `External $ref "${ref}" was not resolved. External refs are not supported yet; the reference was left as-is.`
    )
    return { ...refObject }
  }

  if (state.stack.has(ref)) {
    // Cycle: leave the raw reference in place so recursive schemas stay finite.
    return { $ref: ref }
  }

  const target = resolvePointer(state.root, ref)

  if (target === undefined) {
    state.warnings.push(`$ref "${ref}" could not be resolved: target not found.`)
    return { ...refObject }
  }

  // The target is an object we are currently inside: a recursive schema.
  if (typeof target === "object" && target !== null && ancestors.has(target)) {
    return { $ref: ref }
  }

  state.stack.add(ref)
  const resolvedTarget = walk(target, state, ancestors)
  state.stack.delete(ref)

  if (typeof resolvedTarget !== "object" || resolvedTarget === null) {
    return resolvedTarget
  }

  // OpenAPI 3.1 allows siblings next to $ref; siblings win over target values.
  const siblings: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(refObject)) {
    if (key !== "$ref") {
      siblings[key] = val
    }
  }

  const merged: Record<string, unknown> = { ...(resolvedTarget as object), ...siblings }
  if (state.keepRef) {
    merged.ref = ref
  }
  return merged
}
