import { type MDXRemoteOptions } from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeCodeTitles from "rehype-code-titles";
import { visit } from "unist-util-visit";

export type RemarkPlugins = NonNullable<
  MDXRemoteOptions["mdxOptions"]
>["remarkPlugins"];

export type RehypePlugins = NonNullable<
  MDXRemoteOptions["mdxOptions"]
>["rehypePlugins"];

/**
 * Custom plugin: injects raw code string into <pre> nodes for client usage.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rehypeCodeRaw() {
  return (tree: any) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "pre") {
        const [codeEl] = node.children ?? [];
        if (codeEl?.tagName !== "code") return;

        const raw = codeEl.children?.[0]?.value;
        if (raw) {
          node.properties = node.properties || {};
          node.properties.raw = raw;
        }
      }
    });
  };
}

/**
 * Default recommended plugins for docs.
 */
export const recommendedRemarkPlugins: RemarkPlugins = [remarkGfm];

export const recommendedRehypePlugins: RehypePlugins = [
  rehypeCodeRaw,
  rehypeCodeTitles,
  rehypePrism,
  rehypeSlug,
  rehypeAutolinkHeadings,
];

/**
 * Convert slug (filename or dir) into human-readable title.
 */
export function slugToTitle(slug: string): string {
  return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
