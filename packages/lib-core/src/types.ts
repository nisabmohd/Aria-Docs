/**
 * A navigation entry, shared by every Ariadocs source.
 *
 * `@ariadocs/mdx` builds these from a content directory and `_meta.json`;
 * `@ariadocs/openapi` builds them from tags and operations. Because both use
 * the same shape, one sidebar component can render either.
 */
export interface NavItem {
  /** Display title. */
  title: string
  /** Link target. For groups/folders this points at the section itself. */
  href: string
  /** Whether the item should be shown in navigation. */
  nav: boolean
  /** Custom properties (e.g. from `_meta.json`). */
  props: Record<string, string>
  /** Nested items. Empty for leaf pages. */
  items: NavItem[]
  /** Optional short badge rendered next to the title, e.g. an HTTP method. */
  badge?: string
}

/** A table-of-contents heading. */
export interface TocItem {
  /** Heading text. */
  value: string
  /** Anchor link, e.g. `#installation`. */
  href: string
  /** Heading depth (1–6). */
  depth: number
}

/**
 * A value that survives a JSON round trip. Parsed specs and serialized pages
 * use it instead of `unknown`, so frameworks that check loader data for
 * serializability (TanStack Start, Next.js Pages Router) accept them.
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

/** A JSON object. */
export type JsonObject = { [key: string]: JsonValue }
