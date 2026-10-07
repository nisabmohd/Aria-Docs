/**
 * Turn arbitrary text into a URL/anchor-safe slug.
 *
 * `slugify("Pets & Owners")` → `"pets-owners"`. Returns `fallback` when
 * nothing usable remains (e.g. for `"🚀"`).
 */
export function slugify(value: string, fallback = "item"): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug === "" ? fallback : slug
}

/**
 * Convert a file or folder slug into a human readable title.
 *
 * `slugToTitle("getting-started")` → `"Getting Started"`.
 */
export function slugToTitle(slug: string): string {
  return slug.replace(/[-_]+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Hand out unique ids: the first `"user"` stays `"user"`, later ones become
 * `"user-2"`, `"user-3"`, ... Used wherever ids end up as HTML anchors or
 * route segments and collisions would break links or React keys.
 */
export function createIdGenerator(): (id: string) => string {
  const used = new Set<string>()
  const counters = new Map<string, number>()
  return (id: string) => {
    let candidate = id
    let count = counters.get(id) ?? 1
    while (used.has(candidate)) {
      count += 1
      candidate = `${id}-${count}`
    }
    counters.set(id, count)
    used.add(candidate)
    return candidate
  }
}

/** Shorten text for safe inclusion in error messages. */
export function truncate(value: string, max = 80): string {
  const singleLine = value.replace(/\s+/g, " ")
  return singleLine.length > max ? `${singleLine.slice(0, max - 1)}…` : singleLine
}
