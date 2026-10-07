import fs from "node:fs/promises"
import path from "node:path"
import { slugToTitle } from "@ariadocs/core"
import { z } from "zod"
import { MdxError } from "./errors.js"
import { resolveContentDir } from "./source.js"
import type { ContentDirOptions, NavItem } from "./types.js"

const META_FILE = "_meta.json"

const metaSchema = z.array(
  z.object({
    slug: z.string().min(1),
    title: z.string().optional(),
    nav: z.boolean().optional(),
    props: z.record(z.string()).optional(),
  })
)

type MetaEntry = z.infer<typeof metaSchema>[number]

/** Read `_meta.json`; a missing file is fine, an invalid one is an error. */
async function readMeta(dir: string): Promise<MetaEntry[]> {
  let raw: string
  try {
    raw = await fs.readFile(/* turbopackIgnore: true */ path.join(dir, META_FILE), "utf-8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }

  try {
    return metaSchema.parse(JSON.parse(raw))
  } catch (cause) {
    throw new MdxError(`Invalid ${META_FILE} in "${dir}": ${(cause as Error).message}`, "MDX_INVALID_META", {
      cause,
    })
  }
}

function isVisibleEntry(name: string): boolean {
  // Skip dotfiles and `_private` folders/files (except `_meta.json` itself).
  return !name.startsWith(".") && !name.startsWith("_")
}

/**
 * Build the navigation tree for a content directory.
 *
 * Order, titles, visibility and custom props come from `_meta.json` in each
 * folder. Pages and folders not listed there are appended alphabetically.
 * Entries listed in `_meta.json` without a matching file or folder are
 * ignored, so a typo never produces a dead link. An `index.mdx` page links
 * to its folder (`/guides`), matching how `readMdx` resolves slugs.
 */
export async function getNavigation(options: ContentDirOptions): Promise<NavItem[]> {
  const root = resolveContentDir(options.contentDir)

  const build = async (dir: string, prefix: string, depth: number): Promise<NavItem[]> => {
    if (depth > 32) return []

    const entries = (await fs.readdir(/* turbopackIgnore: true */ dir, { withFileTypes: true })).filter((entry) => isVisibleEntry(entry.name))
    const pages = new Set(entries.filter((e) => e.isFile() && e.name.endsWith(".mdx")).map((e) => e.name.slice(0, -4)))
    const folders = new Set(entries.filter((e) => e.isDirectory()).map((e) => e.name))

    const meta = await readMeta(dir)
    const ordered: MetaEntry[] = []
    const seen = new Set<string>()

    for (const entry of meta) {
      if (seen.has(entry.slug) || (!pages.has(entry.slug) && !folders.has(entry.slug))) continue
      seen.add(entry.slug)
      ordered.push(entry)
    }
    for (const slug of [...new Set([...pages, ...folders])].sort((a, b) => a.localeCompare(b))) {
      if (!seen.has(slug)) ordered.push({ slug })
    }

    const items: NavItem[] = []
    for (const entry of ordered) {
      // `index.mdx` is the folder's own page: `/guides/index` → `/guides`.
      const isIndex = entry.slug === "index" && pages.has("index") && !folders.has("index")
      const href = isIndex ? prefix || "/" : `${prefix}/${entry.slug}`
      items.push({
        title: entry.title ?? slugToTitle(entry.slug),
        href,
        nav: entry.nav ?? true,
        props: entry.props ?? {},
        items: folders.has(entry.slug) ? await build(path.join(dir, entry.slug), href, depth + 1) : [],
      })
    }
    return items
  }

  return build(root, "", 0)
}

/**
 * Every page path in a content directory, e.g. `["/", "/intro", "/guides"]`,
 * for `generateStaticParams` and similar. `index.mdx` maps to its folder.
 */
export async function getPagePaths(options: ContentDirOptions): Promise<string[]> {
  const root = resolveContentDir(options.contentDir)

  const walk = async (dir: string, prefix: string, depth: number): Promise<string[]> => {
    if (depth > 32) return []
    const paths: string[] = []
    for (const entry of await fs.readdir(/* turbopackIgnore: true */ dir, { withFileTypes: true })) {
      if (!isVisibleEntry(entry.name)) continue
      const current = `${prefix}/${entry.name}`
      if (entry.isDirectory()) {
        paths.push(...(await walk(path.join(dir, entry.name), current, depth + 1)))
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        paths.push(entry.name === "index.mdx" ? prefix || "/" : current.slice(0, -4))
      }
    }
    return paths
  }

  return walk(root, "", 0)
}
