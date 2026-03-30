import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeCodeTitles from "rehype-code-titles";
import { visit } from "unist-util-visit";
import type { RemarkPlugins, RehypePlugins } from "./types.js";

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
 * Default recommended remark plugins for docs.
 * Includes: remarkGfm (GitHub Flavored Markdown)
 */
export const recommendedRemarkPlugins: RemarkPlugins = [remarkGfm];

/**
 * Default recommended rehype plugins for docs.
 * Includes: code raw extraction, code titles, prism syntax highlighting, slug, autolink headings
 */
export const recommendedRehypePlugins: RehypePlugins = [
  rehypeCodeRaw,
  rehypeCodeTitles,
  rehypePrism,
  rehypeSlug,
  rehypeAutolinkHeadings,
];

export {
  remarkGfm,
  rehypePrism,
  rehypeAutolinkHeadings,
  rehypeSlug,
  rehypeCodeTitles,
};
