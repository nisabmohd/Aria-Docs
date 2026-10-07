import { serialize } from "next-mdx-remote-client/serialize"
import { MdxServer } from "./components/server.js"
import { MdxError } from "./errors.js"
import { remarkPluginsFor } from "./options.js"
import { loadSource, readMdxFile, splitFrontmatter } from "./source.js"
import { extractToc } from "./toc.js"
import type {
  BaseFrontmatter,
  MdxFileSource,
  MdxOptions,
  ParseMdxResult,
  SerializeMdxResult,
  SerializeResult,
  TocItem,
} from "./types.js"

/** Read the raw MDX of `<contentDir>/<slug>.mdx`. */
export async function readMdx(options: MdxFileSource): Promise<string> {
  return readMdxFile(options.contentDir, options.slug)
}

/** Frontmatter only. */
export async function getFrontmatter<T = BaseFrontmatter>(options: MdxOptions): Promise<T> {
  return splitFrontmatter<T>(await loadSource(options)).frontmatter
}

/** Table of contents only. */
export async function getToc(options: MdxOptions): Promise<TocItem[]> {
  return extractToc(splitFrontmatter(await loadSource(options)).content)
}

/**
 * Parse MDX for **server rendering** (React Server Components): returns the
 * frontmatter, table of contents and the rendered `MDX` element.
 *
 * ```tsx
 * const { MDX, frontmatter, toc } = await parseMdx({ contentDir: "content", slug: "intro" });
 * const { MDX } = await parseMdx({ source: await fetchFromCms(), blockJs: true });
 * ```
 */
export async function parseMdx<T = BaseFrontmatter>(options: MdxOptions): Promise<ParseMdxResult<T>> {
  const source = await loadSource(options)
  const { frontmatter, content } = splitFrontmatter<T>(source)
  const toc = await extractToc(content)

  const MDX = (
    <MdxServer
      source={content}
      remarkPlugins={options.remarkPlugins}
      rehypePlugins={options.rehypePlugins}
      components={options.components}
      blockJs={options.blockJs}
    />
  )

  return { source, content, frontmatter, toc, MDX }
}

/**
 * Compile MDX for **client rendering**: pass `serialized` to
 * `<MdxClient />` from `@ariadocs/mdx/client`.
 */
export async function serializeMdx<T = BaseFrontmatter>(options: MdxOptions): Promise<SerializeMdxResult<T>> {
  const source = await loadSource(options)
  const { frontmatter, content } = splitFrontmatter<T>(source)
  const toc = await extractToc(content)

  const result = await serialize({
    source: content,
    options: {
      disableImports: true,
      disableExports: true,
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: remarkPluginsFor(options),
        rehypePlugins: options.rehypePlugins,
      },
    },
  })

  // Fail here, on the server, instead of shipping the error to the browser.
  if ("error" in result) {
    throw new MdxError(`MDX failed to compile: ${result.error.message}`, "MDX_COMPILE_ERROR", { cause: result.error })
  }

  // Frontmatter is parsed separately and no scope is passed, so both are empty.
  const serialized: SerializeResult = { compiledSource: result.compiledSource, frontmatter: {}, scope: {} }
  return { source, content, frontmatter, toc, serialized }
}
