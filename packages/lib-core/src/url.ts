const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"])

/**
 * Return `url` only if it is safe to put in an `href`.
 *
 * Allows `http(s):`, `mailto:`, `tel:`, protocol-less relative URLs and
 * fragments. Rejects `javascript:`, `data:`, `vbscript:` and anything else,
 * including obfuscated variants such as `" JaVa\tScRiPt:alert(1)"`, which
 * browsers would otherwise execute.
 */
export function sanitizeUrl(url: unknown): string | undefined {
  if (typeof url !== "string") return undefined

  // Browsers strip control characters and whitespace before reading the
  // scheme, so do the same before checking it.
  // eslint-disable-next-line no-control-regex
  const cleaned = url.replace(/[\u0000-\u0020\u007f-\u009f]/g, "")
  if (cleaned === "") return undefined

  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(cleaned)
  if (scheme === null) {
    // Relative URL, path, query or fragment. Reject protocol-relative
    // `//host` (browsers read `\` as `/`, so `/\host` counts too) so a link
    // can't silently point at another origin.
    if (cleaned.replace(/\\/g, "/").startsWith("//")) return undefined
    return url.trim()
  }

  const protocol = `${scheme[1]?.toLowerCase()}:`
  return SAFE_PROTOCOLS.has(protocol) ? url.trim() : undefined
}

/** True when `href` points to another origin (opened in a new tab by UIs). */
export function isExternalUrl(href: string): boolean {
  return /^(https?:)?\/\//i.test(href)
}
