import type { ReactNode } from "react"
import type { NavItem, TocItem } from "@ariadocs/core"
import type { MDXComponents } from "next-mdx-remote-client/rsc"
import type { SerializeResult } from "next-mdx-remote-client/serialize"

// ---------- Plugins ----------

type MdxCompileOptions = NonNullable<import("next-mdx-remote-client/rsc").MDXRemoteOptions["mdxOptions"]>

/** Remark plugins (Markdown AST). */
export type RemarkPlugins = NonNullable<MdxCompileOptions["remarkPlugins"]>

/** Rehype plugins (HTML AST). */
export type RehypePlugins = NonNullable<MdxCompileOptions["rehypePlugins"]>

// ---------- Options ----------

/** Frontmatter when no type is given. */
export type BaseFrontmatter = Record<string, unknown>

/** How MDX is compiled and rendered. Shared by every parse/serialize call and the components. */
export interface MdxRenderOptions {
  /** Remark plugins applied when compiling. */
  remarkPlugins?: RemarkPlugins
  /** Rehype plugins applied when compiling. */
  rehypePlugins?: RehypePlugins
  /** Components used to render MDX elements (`h1`, `pre`, custom tags, ...). */
  components?: MDXComponents
  /**
   * Strip JavaScript from the MDX before compiling: `{expressions}`,
   * `import`/`export` statements and expression attributes such as
   * `<Chart data={...} />`. Enable it for content you don't fully trust
   * (CMS entries, user submissions), because MDX expressions run as code.
   * Default `false`. `import`/`export` are always disabled.
   */
  blockJs?: boolean
}

/** Read MDX from a file: `<contentDir>/<slug>.mdx`. */
export interface MdxFileSource {
  /** Content directory, relative to `process.cwd()` or absolute. */
  contentDir: string
  /** File path inside `contentDir`, without `.mdx` (e.g. `"guides/intro"`). */
  slug: string
}

/** Use an MDX string you already have (CMS, database, GitHub, ...). */
export interface MdxStringSource {
  /** The raw MDX, frontmatter included. */
  source: string
}

/** Options for `parseMdx`, `serializeMdx`, `getFrontmatter` and `getToc`. */
export type MdxOptions = (MdxFileSource | MdxStringSource) & MdxRenderOptions

/** Options for `getNavigation` and `getPagePaths`. */
export interface ContentDirOptions {
  /** Content directory, relative to `process.cwd()` or absolute. */
  contentDir: string
}

// ---------- Results ----------

export interface ParseMdxResult<T = BaseFrontmatter> {
  /** The raw MDX, frontmatter included. */
  source: string
  /** The MDX body without frontmatter. */
  content: string
  frontmatter: T
  toc: TocItem[]
  /** The rendered page, ready to place in a Server Component. */
  MDX: ReactNode
}

export interface SerializeMdxResult<T = BaseFrontmatter> {
  /** The raw MDX, frontmatter included. */
  source: string
  /** The MDX body without frontmatter. */
  content: string
  frontmatter: T
  toc: TocItem[]
  /** Compiled MDX to pass to `<MdxClient serialized={...} />`. */
  serialized: SerializeResult
}

// ---------- Components ----------

export interface MdxServerProps extends MdxRenderOptions {
  /** MDX body (without frontmatter). */
  source: string
}

export interface MdxClientProps {
  /** The `serialized` value from `serializeMdx()`. */
  serialized: SerializeResult
  /** Components used to render MDX elements. */
  components?: MDXComponents
}

// ---------- Re-exports ----------

export type { MDXComponents, NavItem, TocItem, SerializeResult }
