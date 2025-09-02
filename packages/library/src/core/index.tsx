import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";
import { remark } from "remark";
import remarkFlexibleToc, { type TocItem } from "remark-flexible-toc";
import {
  slugToTitle,
  type RemarkPlugins,
  type RehypePlugins,
} from "@ariadocs/react/utils";
import { MdxServer } from "@ariadocs/react/server";
import {
  serialize,
  type SerializeOptions,
  type SerializeResult,
} from "next-mdx-remote-client/serialize";
import { type MDXComponents } from "next-mdx-remote-client/rsc";

// ---------- Types ----------
export type BaseFrontmatter = Record<string, string | string[]>;

export type DocsConfigLocal = {
  contentDir: string;
  remarkPlugins?: RemarkPlugins;
  rehypePlugins?: RehypePlugins;
  mdxComponents?: MDXComponents;
};

export type DocsConfigRemote = Omit<DocsConfigLocal, "contentDir">;

export type MetaItem = {
  slug: string;
  title: string;
  nav: boolean;
  props: Record<string, string>;
};

export type NavItem = {
  title: string;
  href: string;
  nav: boolean;
  props: Record<string, string>;
  items: NavItem[];
};

// ---------- Helpers ----------
const metaFile = "_meta.json";

const metaSchema = z.array(
  z.object({
    slug: z.string(),
    title: z.string().optional(),
    nav: z.boolean().optional().default(true),
    props: z.record(z.string()).optional().default({}),
  })
);

async function loadMeta(dir: string): Promise<MetaItem[]> {
  const map = new Map<string, MetaItem>();
  const entries = await fs.readdir(dir);

  // step 1: defaults from files
  for (const entry of entries) {
    if (entry.endsWith(".mdx")) {
      const slug = entry.replace(/\.mdx$/, "");
      map.set(slug, {
        slug,
        title: slugToTitle(slug),
        nav: true,
        props: {},
      });
    }
  }

  const sequence = new Map<string, number>();

  // step 2: overlay from _meta.json
  try {
    const metaPath = path.join(dir, metaFile);
    const raw = await fs.readFile(metaPath, "utf-8");
    const parsed = metaSchema.parse(JSON.parse(raw));
    parsed.forEach((m, idx) => {
      if (map.has(m.slug)) {
        sequence.set(m.slug, idx);
        map.set(m.slug, {
          ...map.get(m.slug)!,
          ...m,
          title: m.title ?? slugToTitle(m.slug),
        });
      }
    });
  } catch {
    // no _meta.json → ignore
  }

  // step 3: sort
  return [...map.values()].sort((a, b) => {
    const ai = sequence.get(a.slug);
    const bi = sequence.get(b.slug);
    if (ai != null && bi != null) return ai - bi;
    if (ai != null) return -1;
    if (bi != null) return 1;
    return a.slug.localeCompare(b.slug);
  });
}

async function extractToc(content: string): Promise<TocItem[]> {
  const toc: TocItem[] = [];
  await remark().use(remarkFlexibleToc, { tocRef: toc }).process(content);
  return toc;
}

function splitMatter(raw: string) {
  return matter(raw);
}

async function parseMdx<F = BaseFrontmatter>(
  raw: string,
  config: DocsConfigLocal | DocsConfigRemote
) {
  const { content, data } = splitMatter(raw);
  const frontmatter = data as F;
  const toc = await extractToc(content);

  const MDX = (
    <MdxServer
      raw={content}
      options={{
        rehypePlugins: config.rehypePlugins,
        remarkPlugins: config.remarkPlugins,
      }}
      components={config.mdxComponents}
    />
  );

  return { raw, content, frontmatter, toc, MDX };
}

async function serializeMdx<F = BaseFrontmatter>(
  raw: string,
  config: DocsConfigLocal | DocsConfigRemote
) {
  const { content, data } = splitMatter(raw);
  const frontmatter = data as F;
  const toc = await extractToc(content);

  const options: SerializeOptions = {
    disableImports: true,
    parseFrontmatter: false,
    mdxOptions: {
      rehypePlugins: config.rehypePlugins,
      remarkPlugins: config.remarkPlugins,
    },
  };

  const serialized: SerializeResult = await serialize({
    source: content,
    options,
  });

  return { raw, content, frontmatter, toc, serialized };
}

// ---------- Classes ----------
export class LocalDocs<F = BaseFrontmatter> {
  private cfg: DocsConfigLocal;
  private cache = new Map<string, string>();

  constructor(cfg: DocsConfigLocal) {
    this.cfg = cfg;
  }

  private async resolveFile(slug: string) {
    return path.join(process.cwd(), this.cfg.contentDir, `${slug}.mdx`);
  }

  private async loadRaw(slug: string) {
    if (this.cache.has(slug)) return this.cache.get(slug)!;
    const file = await this.resolveFile(slug);
    const raw = await fs.readFile(file, "utf-8");
    this.cache.set(slug, raw);
    return raw;
  }

  async frontmatter({ slug }: { slug: string }): Promise<F> {
    const raw = await this.loadRaw(slug);
    return splitMatter(raw).data as F;
  }

  async toc({ slug }: { slug: string }) {
    return extractToc(await this.loadRaw(slug));
  }

  async parse({ slug }: { slug: string }) {
    return parseMdx<F>(await this.loadRaw(slug), this.cfg);
  }

  async serialize({ slug }: { slug: string }) {
    return serializeMdx<F>(await this.loadRaw(slug), this.cfg);
  }

  async pagePaths(): Promise<string[]> {
    const walk = async (dir: string, prefix = ""): Promise<string[]> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const paths: string[] = [];
      for (const e of entries) {
        const full = path.join(dir, e.name);
        const current = `${prefix}/${e.name}`;
        if (e.isDirectory()) {
          paths.push(...(await walk(full, current)));
        } else if (e.isFile() && e.name.endsWith(".mdx")) {
          paths.push(current.replace(/\.mdx$/, ""));
        }
      }
      return paths;
    };
    return walk(path.join(process.cwd(), this.cfg.contentDir));
  }

  async navItems(): Promise<NavItem[]> {
    const build = async (dir: string, prefix = ""): Promise<NavItem[]> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const meta = await loadMeta(dir);
      const metaMap = new Map(meta.map((m) => [m.slug, m]));
      const items: NavItem[] = [];

      // meta first
      for (const m of meta) {
        const target = path.join(dir, m.slug);
        const href = `${prefix}/${m.slug}`;
        const dirEntry = entries.find(
          (e) => e.isDirectory() && e.name === m.slug
        );

        if (dirEntry) {
          const sub = await build(target, href);
          items.push({
            title: m.title,
            href,
            nav: m.nav,
            props: m.props,
            items: sub,
          });
        } else {
          items.push({
            title: m.title,
            href,
            nav: m.nav,
            props: m.props,
            items: [],
          });
        }
      }

      // leftovers
      for (const e of entries) {
        if (e.name === metaFile) continue;
        const slug = e.name.replace(/\.mdx$/, "");
        if (metaMap.has(slug)) continue;

        const href = `${prefix}/${slug}`;
        const full = path.join(dir, e.name);

        if (e.isDirectory()) {
          const sub = await build(full, href);
          items.push({
            title: slugToTitle(slug),
            href,
            nav: true,
            props: {},
            items: sub,
          });
        } else if (e.isFile() && e.name.endsWith(".mdx")) {
          items.push({
            title: slugToTitle(slug),
            href,
            nav: true,
            props: {},
            items: [],
          });
        }
      }
      return items;
    };

    return build(path.join(process.cwd(), this.cfg.contentDir));
  }
}

export class RemoteDocs<F = BaseFrontmatter> {
  private cfg: DocsConfigRemote;

  constructor(cfg: DocsConfigRemote) {
    this.cfg = cfg;
  }

  async frontmatter({ raw }: { raw: string }): Promise<F> {
    return splitMatter(raw).data as F;
  }

  async toc({ raw }: { raw: string }) {
    return extractToc(raw);
  }

  async parse({ raw }: { raw: string }) {
    return parseMdx<F>(raw, this.cfg);
  }

  async serialize({ raw }: { raw: string }) {
    return serializeMdx<F>(raw, this.cfg);
  }
}
