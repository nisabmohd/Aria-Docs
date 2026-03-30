import type {
  DocsConfig,
  BaseFrontmatter,
  ParseResult,
  SerializeResult,
  NavItem,
  TocItem,
} from "./types.js";
import {
  parseMdx,
  serializeMdx,
  getFrontmatter,
  getToc,
  readMdx,
  type LocalOptions,
} from "./parse.js";
import { getNavItems, getPagePaths } from "./nav.js";

/**
 * Options for individual parse operations (slug only, rest is pre-configured)
 */
export interface ParseSlugOptions {
  /** Slug/path to the MDX file (without extension) */
  slug: string;
  /** Override remark plugins (optional) */
  remarkPlugins?: DocsConfig["remarkPlugins"];
  /** Override rehype plugins (optional) */
  rehypePlugins?: DocsConfig["rehypePlugins"];
  /** Override MDX components (optional) */
  mdxComponents?: DocsConfig["mdxComponents"];
}

/**
 * Factory function return type
 */
export interface DocsInstance {
  /** Parse MDX for server-side rendering */
  parse: <T = BaseFrontmatter>(
    options: ParseSlugOptions,
  ) => Promise<ParseResult<T>>;
  /** Serialize MDX for client-side rendering */
  serialize: <T = BaseFrontmatter>(
    options: ParseSlugOptions,
  ) => Promise<SerializeResult<T>>;
  /** Get frontmatter only */
  getFrontmatter: <T = BaseFrontmatter>(
    options: ParseSlugOptions,
  ) => Promise<T>;
  /** Get table of contents only */
  getToc: (options: ParseSlugOptions) => Promise<TocItem[]>;
  /** Read raw MDX content */
  readMdx: (options: ParseSlugOptions) => Promise<string>;
  /** Get navigation items */
  getNavItems: () => Promise<NavItem[]>;
  /** Get all page paths */
  getPagePaths: () => Promise<string[]>;
  /** The original config (readonly) */
  readonly config: DocsConfig;
}

/**
 * Create a docs instance with pre-configured options.
 * Eliminates the need to pass repetitive options to each function call.
 *
 * @example
 * ```tsx
 * const docs = createDocs({
 *   contentDir: "contents/docs",
 *   rehypePlugins: recommendedRehypePlugins,
 * });
 *
 * // All methods use the shared config
 * const { MDX, frontmatter } = await docs.parse({ slug: "getting-started" });
 * const navItems = await docs.getNavItems();
 * const paths = await docs.getPagePaths();
 * ```
 */
export function createDocs(config: DocsConfig): DocsInstance {
  const { contentDir, remarkPlugins, rehypePlugins, mdxComponents } = config;

  const buildOptions = (options: ParseSlugOptions): LocalOptions => ({
    contentDir,
    slug: options.slug,
    remarkPlugins: options.remarkPlugins ?? remarkPlugins,
    rehypePlugins: options.rehypePlugins ?? rehypePlugins,
    mdxComponents: options.mdxComponents ?? mdxComponents,
  });

  return {
    parse: async <T = BaseFrontmatter>(options: ParseSlugOptions) => {
      return parseMdx<T>(buildOptions(options));
    },

    serialize: async <T = BaseFrontmatter>(options: ParseSlugOptions) => {
      return serializeMdx<T>(buildOptions(options));
    },

    getFrontmatter: async <T = BaseFrontmatter>(options: ParseSlugOptions) => {
      return getFrontmatter<T>(buildOptions(options));
    },

    getToc: async (options: ParseSlugOptions) => {
      return getToc(buildOptions(options));
    },

    readMdx: async (options: ParseSlugOptions) => {
      return readMdx(buildOptions(options));
    },

    getNavItems: async () => {
      return getNavItems({ contentDir });
    },

    getPagePaths: async () => {
      return getPagePaths({ contentDir });
    },

    get config() {
      return config;
    },
  };
}
