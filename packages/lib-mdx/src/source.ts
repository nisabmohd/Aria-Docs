import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import { truncate } from "@ariadocs/core"
import { MdxError } from "./errors.js"
import type { MdxOptions } from "./types.js"

/** Absolute path of a content directory (relative paths resolve against `process.cwd()`). */
export function resolveContentDir(contentDir: string): string {
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), contentDir)
}

/**
 * Map a slug to its `.mdx` file, refusing anything that would leave the
 * content directory: `../secret`, absolute paths, NUL bytes, ... Slugs often
 * come straight from URLs (`/docs/[...slug]`), so this is the line between a
 * docs page and arbitrary file reads.
 */
export function resolveMdxPath(contentDir: string, slug: string): string {
  const root = resolveContentDir(contentDir)

  const normalized = normalizeSlug(slug)
  const segments = normalized.split("/")
  if (
    slug.includes("\0") ||
    segments.some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    throw new MdxError(`Invalid MDX slug "${truncate(slug, 60)}".`, "MDX_INVALID_SLUG")
  }

  const file = path.resolve(root, `${normalized}.mdx`)
  if (!file.startsWith(root + path.sep)) {
    throw new MdxError(`Invalid MDX slug "${truncate(slug, 60)}".`, "MDX_INVALID_SLUG")
  }
  return file
}

/** `""`, `"/"` → `"index"`; trims slashes and normalizes `\\` to `/`. */
function normalizeSlug(slug: string): string {
  const normalized = slug.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "")
  return normalized === "" && slug.length <= 1 ? "index" : normalized
}

/**
 * Read the raw MDX for a slug: `<slug>.mdx`, falling back to
 * `<slug>/index.mdx`. An empty slug reads `index.mdx`. Throws `MdxError`
 * (`MDX_NOT_FOUND`) when neither exists.
 */
export async function readMdxFile(contentDir: string, slug: string): Promise<string> {
  const candidates = [resolveMdxPath(contentDir, slug)]
  const normalized = normalizeSlug(slug)
  if (normalized !== "index" && !normalized.endsWith("/index")) {
    candidates.push(resolveMdxPath(contentDir, `${normalized}/index`))
  }

  for (const file of candidates) {
    try {
      return await fs.readFile(/* turbopackIgnore: true */ file, "utf-8")
    } catch (cause) {
      const code = (cause as NodeJS.ErrnoException).code
      if (code !== "ENOENT" && code !== "ENOTDIR" && code !== "EISDIR") throw cause
    }
  }
  throw new MdxError(`MDX page "${truncate(slug, 60)}" not found.`, "MDX_NOT_FOUND")
}

/** The raw MDX for either source kind. */
export async function loadSource(options: MdxOptions): Promise<string> {
  if ("source" in options && typeof options.source === "string") return options.source
  if ("contentDir" in options) return readMdxFile(options.contentDir, options.slug)
  throw new TypeError("Pass either { source } or { contentDir, slug }.")
}

function refuseJavaScript(): never {
  throw new MdxError(
    "JavaScript frontmatter (---js) is not supported. Use YAML or JSON frontmatter.",
    "MDX_INVALID_META"
  )
}

/**
 * Split raw MDX into frontmatter and body.
 *
 * gray-matter evaluates `---js` / `---javascript` frontmatter with `eval` by
 * default, which would run arbitrary code from content. Those engines are
 * replaced with one that throws. Passing options also disables gray-matter's
 * shared cache, so callers can't mutate each other's frontmatter.
 */
export function splitFrontmatter<T>(source: string): { frontmatter: T; content: string } {
  const { data, content } = matter(source, {
    engines: { js: refuseJavaScript, javascript: refuseJavaScript },
  })
  return { frontmatter: data as T, content }
}
