import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkFlexibleToc, { type TocItem } from "remark-flexible-toc";
import {
  serialize,
  type SerializeResult as SerializedSource,
} from "next-mdx-remote-client/serialize";
import type {
  DocsConfig,
  RemoteDocsConfig,
  ParseResult,
  SerializeResult,
  BaseFrontmatter,
} from "./types.js";
import { MdxServer } from "./components/server.js";

// ---------- Helpers ----------

/**
 * Extract table of contents from MDX content.
 */
async function extractToc(content: string): Promise<TocItem[]> {
  const toc: TocItem[] = [];
  await remark().use(remarkFlexibleToc, { tocRef: toc }).process(content);
  return toc;
}

/**
 * Split raw MDX into frontmatter and content.
 */
function splitMatter(raw: string) {
  return matter(raw);
}

/**
 * Resolve file path from slug.
 */
function resolveFilePath(contentDir: string, slug: string): string {
  return path.join(process.cwd(), contentDir, `${slug}.mdx`);
}

// ---------- Local Docs Functions ----------

/**
 * Options for local MDX operations.
 */
export interface LocalOptions {
  /** Path to content directory relative to project root */
  contentDir: string;
  /** Slug/path to the MDX file (without extension) */
  slug: string;
  /** Remark plugins */
  remarkPlugins?: DocsConfig["remarkPlugins"];
  /** Rehype plugins */
  rehypePlugins?: DocsConfig["rehypePlugins"];
  /** MDX components */
  mdxComponents?: DocsConfig["mdxComponents"];
}

/**
 * Read raw MDX file content.
 */
export async function readMdx(options: LocalOptions): Promise<string> {
  const { contentDir, slug } = options;
  const filePath = resolveFilePath(contentDir, slug);
  return fs.readFile(filePath, "utf-8");
}

/**
 * Get frontmatter from a local MDX file.
 */
export async function getFrontmatter<T = BaseFrontmatter>(
  options: LocalOptions,
): Promise<T> {
  const raw = await readMdx(options);
  return splitMatter(raw).data as T;
}

/**
 * Get table of contents from a local MDX file.
 */
export async function getToc(options: LocalOptions): Promise<TocItem[]> {
  const raw = await readMdx(options);
  const { content } = splitMatter(raw);
  return extractToc(content);
}

/**
 * Parse a local MDX file for server-side rendering.
 * Returns frontmatter, toc, and rendered MDX component.
 */
export async function parseMdx<T = BaseFrontmatter>(
  options: LocalOptions,
): Promise<ParseResult<T>> {
  const raw = await readMdx(options);
  const { content, data } = splitMatter(raw);
  const frontmatter = data as T;
  const toc = await extractToc(content);

  const MDX = (
    <MdxServer
      raw={content}
      options={{
        rehypePlugins: options.rehypePlugins,
        remarkPlugins: options.remarkPlugins,
      }}
      components={options.mdxComponents}
    />
  );

  return { raw, content, frontmatter, toc, MDX };
}

/**
 * Serialize a local MDX file for client-side rendering.
 * Returns frontmatter, toc, and serialized result.
 */
export async function serializeMdx<T = BaseFrontmatter>(
  options: LocalOptions,
): Promise<SerializeResult<T>> {
  const raw = await readMdx(options);
  const { content, data } = splitMatter(raw);
  const frontmatter = data as T;
  const toc = await extractToc(content);

  const serialized: SerializedSource = await serialize({
    source: content,
    options: {
      disableImports: true,
      parseFrontmatter: false,
      mdxOptions: {
        rehypePlugins: options.rehypePlugins,
        remarkPlugins: options.remarkPlugins,
      },
    },
  });

  return { raw, content, frontmatter, toc, serialized };
}

// ---------- Remote Docs Functions ----------

/**
 * Options for remote MDX operations.
 */
export interface RemoteOptions {
  /** Raw MDX content string */
  raw: string;
  /** Remark plugins */
  remarkPlugins?: RemoteDocsConfig["remarkPlugins"];
  /** Rehype plugins */
  rehypePlugins?: RemoteDocsConfig["rehypePlugins"];
  /** MDX components */
  mdxComponents?: RemoteDocsConfig["mdxComponents"];
}

/**
 * Get frontmatter from raw MDX content.
 */
export async function getFrontmatterRemote<T = BaseFrontmatter>(
  options: RemoteOptions,
): Promise<T> {
  return splitMatter(options.raw).data as T;
}

/**
 * Get table of contents from raw MDX content.
 */
export async function getTocRemote(options: RemoteOptions): Promise<TocItem[]> {
  const { content } = splitMatter(options.raw);
  return extractToc(content);
}

/**
 * Parse raw MDX content for server-side rendering.
 */
export async function parseMdxRemote<T = BaseFrontmatter>(
  options: RemoteOptions,
): Promise<ParseResult<T>> {
  const { raw } = options;
  const { content, data } = splitMatter(raw);
  const frontmatter = data as T;
  const toc = await extractToc(content);

  const MDX = (
    <MdxServer
      raw={content}
      options={{
        rehypePlugins: options.rehypePlugins,
        remarkPlugins: options.remarkPlugins,
      }}
      components={options.mdxComponents}
    />
  );

  return { raw, content, frontmatter, toc, MDX };
}

/**
 * Serialize raw MDX content for client-side rendering.
 */
export async function serializeMdxRemote<T = BaseFrontmatter>(
  options: RemoteOptions,
): Promise<SerializeResult<T>> {
  const { raw } = options;
  const { content, data } = splitMatter(raw);
  const frontmatter = data as T;
  const toc = await extractToc(content);

  const serialized: SerializedSource = await serialize({
    source: content,
    options: {
      disableImports: true,
      parseFrontmatter: false,
      mdxOptions: {
        rehypePlugins: options.rehypePlugins,
        remarkPlugins: options.remarkPlugins,
      },
    },
  });

  return { raw, content, frontmatter, toc, serialized };
}