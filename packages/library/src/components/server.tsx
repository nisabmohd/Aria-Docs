import { MDXRemote, type MDXComponents } from "next-mdx-remote-client/rsc";
import type { RemarkPlugins, RehypePlugins, MdxServerProps } from "../types.js";

/**
 * Server component for rendering MDX content.
 * Use this in React Server Components (RSC) context.
 *
 * @example
 * ```tsx
 * import { MdxServer, recommendedRehypePlugins } from "@ariadocs/react";
 *
 * export function Page({ content }: { content: string }) {
 *   return (
 *     <MdxServer
 *       raw={content}
 *       options={{ rehypePlugins: recommendedRehypePlugins }}
 *     />
 *   );
 * }
 * ```
 */
export function MdxServer({ raw, options, components }: MdxServerProps) {
  return (
    <MDXRemote
      source={raw}
      options={{
        mdxOptions: {
          rehypePlugins: options?.rehypePlugins,
          remarkPlugins: options?.remarkPlugins,
        },
        parseFrontmatter: false,
      }}
      components={components}
    />
  );
}

// Re-export types for convenience
export type { MdxServerProps, RemarkPlugins, RehypePlugins, MDXComponents };