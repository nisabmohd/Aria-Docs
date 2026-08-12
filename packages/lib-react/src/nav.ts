import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import type { NavItem, MetaItem } from "./types.js";

// ---------- Constants ----------

const META_FILE = "_meta.json";

// ---------- Schema ----------

const metaSchema = z.array(
  z.object({
    slug: z.string(),
    title: z.string().optional(),
    nav: z.boolean().optional().default(true),
    props: z.record(z.string()).optional().default({}),
  }),
);

// ---------- Helpers ----------

/**
 * Convert slug (filename or dir) into human-readable title.
 */
export function slugToTitle(slug: string): string {
  return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Load and parse _meta.json from a directory.
 * Returns meta items with sequence information preserved.
 */
async function loadMeta(
  dir: string,
): Promise<{ items: MetaItem[]; sequence: Map<string, number> }> {
  const items: MetaItem[] = [];
  const sequence = new Map<string, number>();

  // Get all MDX files in directory as defaults
  const entries = await fs.readdir(dir);
  const defaultItems = new Map<string, MetaItem>();

  for (const entry of entries) {
    if (entry.endsWith(".mdx")) {
      const slug = entry.replace(/\.mdx$/, "");
      defaultItems.set(slug, {
        slug,
        title: slugToTitle(slug),
        nav: true,
        props: {},
      });
    }
  }

  // Try to read _meta.json
  try {
    const metaPath = path.join(dir, META_FILE);
    const raw = await fs.readFile(metaPath, "utf-8");
    const parsed = metaSchema.parse(JSON.parse(raw));

    // Build sequence from _meta.json order
    parsed.forEach((m, idx) => {
      sequence.set(m.slug, idx);
    });

    // Merge _meta.json settings with defaults
    for (const m of parsed) {
      const existing = defaultItems.get(m.slug);
      if (existing) {
        items.push({
          ...existing,
          title: m.title ?? existing.title,
          nav: m.nav ?? existing.nav,
          props: m.props ?? existing.props,
        });
        defaultItems.delete(m.slug);
      } else {
        // Item in _meta.json but no corresponding .mdx file
        // Could be a directory reference
        items.push({
          slug: m.slug,
          title: m.title ?? slugToTitle(m.slug),
          nav: m.nav ?? true,
          props: m.props ?? {},
        });
      }
    }

    // Add remaining items not in _meta.json (append at end, sorted alphabetically)
    const leftovers = [...defaultItems.values()].sort((a, b) =>
      a.slug.localeCompare(b.slug),
    );
    items.push(...leftovers);
  } catch {
    // No _meta.json - use defaults sorted alphabetically
    for (const [slug, item] of [...defaultItems.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      items.push(item);
    }
  }

  return { items, sequence };
}

// ---------- Public Functions ----------

/**
 * Options for getting navigation items.
 */
export interface GetNavItemsOptions {
  /** Path to content directory relative to project root */
  contentDir: string;
}

/**
 * Get navigation tree for the docs content.
 *
 * Reads _meta.json files in each directory to determine:
 * - Order of items (sequence)
 * - Custom titles
 * - Whether to show in nav
 * - Custom props
 *
 * Items not in _meta.json are appended at the end (sorted alphabetically).
 */
export async function getNavItems(
  options: GetNavItemsOptions,
): Promise<NavItem[]> {
  const { contentDir } = options;
  const rootDir = path.join(process.cwd(), contentDir);

  const build = async (dir: string, prefix = ""): Promise<NavItem[]> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const { items: metaItems, sequence } = await loadMeta(dir);
    const result: NavItem[] = [];
    const processed = new Set<string>();

    // Process items in _meta.json order first
    for (const meta of metaItems) {
      const href = `${prefix}/${meta.slug}`;
      const fullPath = path.join(dir, meta.slug);
      const dirEntry = entries.find((e) => e.name === meta.slug);

      // Check if it's a directory
      if (dirEntry?.isDirectory()) {
        const subItems = await build(fullPath, href);
        result.push({
          title: meta.title,
          href,
          nav: meta.nav,
          props: meta.props,
          items: subItems,
        });
      } else {
        // It's a file (or will be)
        const mdxEntry = entries.find(
          (e) => e.isFile() && e.name === `${meta.slug}.mdx`,
        );
        if (mdxEntry || dirEntry) {
          result.push({
            title: meta.title,
            href,
            nav: meta.nav,
            props: meta.props,
            items: [],
          });
        }
      }
      processed.add(meta.slug);
    }

    // Process remaining directories/files not in _meta.json
    for (const entry of entries) {
      if (
        entry.name === META_FILE ||
        processed.has(entry.name.replace(/\.mdx$/, ""))
      ) {
        continue;
      }

      const slug = entry.name.replace(/\.mdx$/, "");
      const href = `${prefix}/${slug}`;
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const subItems = await build(fullPath, href);
        result.push({
          title: slugToTitle(slug),
          href,
          nav: true,
          props: {},
          items: subItems,
        });
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        result.push({
          title: slugToTitle(slug),
          href,
          nav: true,
          props: {},
          items: [],
        });
      }
    }

    return result;
  };

  return build(rootDir);
}

/**
 * Options for getting page paths.
 */
export interface GetPagePathsOptions {
  /** Path to content directory relative to project root */
  contentDir: string;
}

/**
 * Get all page paths for static generation.
 * Returns array of slug paths (e.g., ["/getting-started", "/advanced/config"])
 */
export async function getPagePaths(
  options: GetPagePathsOptions,
): Promise<string[]> {
  const { contentDir } = options;
  const rootDir = path.join(process.cwd(), contentDir);

  const walk = async (dir: string, prefix = ""): Promise<string[]> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const paths: string[] = [];

    for (const entry of entries) {
      if (entry.name === META_FILE) continue;

      const current = `${prefix}/${entry.name}`;
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        paths.push(...(await walk(fullPath, current)));
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        paths.push(current.replace(/\.mdx$/, ""));
      }
    }

    return paths;
  };

  return walk(rootDir);
}
