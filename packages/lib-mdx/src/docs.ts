import { getNavigation, getPagePaths } from "./nav.js"
import { getFrontmatter, getToc, parseMdx, readMdx, serializeMdx } from "./parse.js"
import type {
  BaseFrontmatter,
  MdxRenderOptions,
  NavItem,
  ParseMdxResult,
  SerializeMdxResult,
  TocItem,
} from "./types.js"

/** Configuration for `createDocs`. */
export interface DocsConfig extends MdxRenderOptions {
  /** Content directory, relative to `process.cwd()` or absolute. */
  contentDir: string
}

/** Per-page options: the slug, plus optional overrides of the instance config. */
export interface DocsPageOptions extends MdxRenderOptions {
  /** File path inside `contentDir`, without `.mdx`. */
  slug: string
}

/** The object returned by `createDocs`. */
export interface DocsInstance {
  /** Parse a page for server rendering. */
  parse: <T = BaseFrontmatter>(options: DocsPageOptions) => Promise<ParseMdxResult<T>>
  /** Compile a page for client rendering with `<MdxClient />`. */
  serialize: <T = BaseFrontmatter>(options: DocsPageOptions) => Promise<SerializeMdxResult<T>>
  /** Read a page's raw MDX. */
  read: (options: DocsPageOptions) => Promise<string>
  /** A page's frontmatter. */
  getFrontmatter: <T = BaseFrontmatter>(options: DocsPageOptions) => Promise<T>
  /** A page's table of contents. */
  getToc: (options: DocsPageOptions) => Promise<TocItem[]>
  /** Sidebar navigation (`NavItem[]`, same shape as `@ariadocs/openapi`). */
  getNavigation: () => Promise<NavItem[]>
  /** Every page path, for static generation. */
  getPagePaths: () => Promise<string[]>
  /** The config this instance was created with. */
  readonly config: DocsConfig
}

/**
 * Create a docs instance with its options set once — the MDX counterpart of
 * `createOpenAPI` in `@ariadocs/openapi`.
 *
 * ```ts
 * export const docs = createDocs({ contentDir: "content/docs", rehypePlugins: [rehypeSlug] });
 *
 * const { MDX, frontmatter, toc } = await docs.parse({ slug: "getting-started" });
 * const nav = await docs.getNavigation();
 * ```
 */
export function createDocs(config: DocsConfig): DocsInstance {
  const withConfig = ({ slug, ...overrides }: DocsPageOptions) => ({
    contentDir: config.contentDir,
    slug,
    remarkPlugins: overrides.remarkPlugins ?? config.remarkPlugins,
    rehypePlugins: overrides.rehypePlugins ?? config.rehypePlugins,
    components: overrides.components ?? config.components,
    blockJs: overrides.blockJs ?? config.blockJs,
  })

  return {
    parse: (options) => parseMdx(withConfig(options)),
    serialize: (options) => serializeMdx(withConfig(options)),
    read: (options) => readMdx(withConfig(options)),
    getFrontmatter: (options) => getFrontmatter(withConfig(options)),
    getToc: (options) => getToc(withConfig(options)),
    getNavigation: () => getNavigation({ contentDir: config.contentDir }),
    getPagePaths: () => getPagePaths({ contentDir: config.contentDir }),
    get config() {
      return config
    },
  }
}
