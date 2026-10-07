import { MDXRemote } from "next-mdx-remote-client/rsc"
import { remarkPluginsFor } from "../options.js"
import type { MdxServerProps } from "../types.js"

/**
 * Render MDX in a React Server Component.
 *
 * ```tsx
 * <MdxServer source={content} rehypePlugins={[rehypeSlug]} components={{ Callout }} />
 * ```
 */
export function MdxServer({ source, remarkPlugins, rehypePlugins, components, blockJs }: MdxServerProps) {
  return (
    <MDXRemote
      source={source}
      options={{
        disableImports: true,
        disableExports: true,
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: remarkPluginsFor({ remarkPlugins, blockJs }),
          rehypePlugins,
        },
      }}
      components={components}
    />
  )
}

export type { MdxServerProps }
