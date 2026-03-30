import type { MDXComponents } from "next-mdx-remote-client/rsc";
import type { SerializeResult as SerializedSource } from "next-mdx-remote-client/serialize";
import type { TocItem } from "remark-flexible-toc";

// ---------- Core Types ----------

/**
 * Base frontmatter structure for MDX files
 */
export type BaseFrontmatter = Record<string, string | string[]>;

/**
 * Configuration for local docs (file system based)
 */
export interface DocsConfig {
  /** Path to content directory relative to project root */
  contentDir: string;
  /** Remark plugins to apply during MDX processing */
  remarkPlugins?: RemarkPlugins;
  /** Rehype plugins to apply during MDX processing */
  rehypePlugins?: RehypePlugins;
  /** MDX components to use for rendering */
  mdxComponents?: MDXComponents;
}

/**
 * Configuration for remote docs (string based)
 */
export interface RemoteDocsConfig {
  remarkPlugins?: RemarkPlugins;
  rehypePlugins?: RehypePlugins;
  mdxComponents?: MDXComponents;
}

/**
 * Options for parsing a single MDX file
 */
export interface ParseOptions {
  /** Slug/path to the MDX file (without extension) */
  slug: string;
}

/**
 * Options for remote MDX parsing
 */
export interface RemoteParseOptions {
  /** Raw MDX content string */
  raw: string;
}

// ---------- Result Types ----------

/**
 * Result from parsing MDX content
 */
export interface ParseResult<T = BaseFrontmatter> {
  /** Raw MDX content with frontmatter */
  raw: string;
  /** MDX content without frontmatter */
  content: string;
  /** Parsed frontmatter */
  frontmatter: T;
  /** Table of contents items */
  toc: TocItem[];
  /** Rendered MDX (React Server Component) */
  MDX: React.ReactNode;
}

/**
 * Result from serializing MDX for client-side rendering
 */
export interface SerializeResult<T = BaseFrontmatter> {
  /** Raw MDX content with frontmatter */
  raw: string;
  /** MDX content without frontmatter */
  content: string;
  /** Parsed frontmatter */
  frontmatter: T;
  /** Table of contents items */
  toc: TocItem[];
  /** Serialized result for client */
  serialized: SerializedSource;
}

// ---------- Navigation Types ----------

/**
 * Item from _meta.json file
 */
export interface MetaItem {
  /** File/folder slug (without extension) */
  slug: string;
  /** Display title (optional, defaults to slugToTitle) */
  title: string;
  /** Whether to show in navigation */
  nav: boolean;
  /** Custom properties for rendering */
  props: Record<string, string>;
}

/**
 * Navigation item for rendering sidebar/nav
 */
export interface NavItem {
  /** Display title */
  title: string;
  /** URL path */
  href: string;
  /** Whether to show in navigation */
  nav: boolean;
  /** Custom properties from _meta.json */
  props: Record<string, string>;
  /** Nested navigation items */
  items: NavItem[];
}

// ---------- Plugin Types ----------

/**
 * Remark plugin type
 */
export type RemarkPlugins = NonNullable<
  NonNullable<
    import("next-mdx-remote-client/rsc").MDXRemoteOptions["mdxOptions"]
  >["remarkPlugins"]
>;

/**
 * Rehype plugin type
 */
export type RehypePlugins = NonNullable<
  NonNullable<
    import("next-mdx-remote-client/rsc").MDXRemoteOptions["mdxOptions"]
  >["rehypePlugins"]
>;

// ---------- Component Types ----------

/**
 * Props for MdxServer component
 */
export interface MdxServerProps {
  /** Raw MDX content (without frontmatter) */
  raw: string;
  /** Plugin options */
  options?: {
    remarkPlugins?: RemarkPlugins;
    rehypePlugins?: RehypePlugins;
  };
  /** MDX components for rendering */
  components?: MDXComponents;
}

/**
 * Props for MdxClient component
 */
export interface MdxClientProps {
  /** Serialized MDX result */
  serialized: SerializedSource;
  /** MDX components for rendering */
  mdxComponents?: MDXComponents;
}

// ---------- Re-exports ----------

export type { MDXComponents, TocItem };
