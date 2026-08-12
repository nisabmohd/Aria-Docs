import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeCodeTitles from "rehype-code-titles";
import { visit } from "unist-util-visit";

/**
 * Custom plugin: injects raw code string into <pre> nodes for client usage.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rehypeCodeRaw() {
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

export {
  remarkGfm,
  rehypePrism,
  rehypeAutolinkHeadings,
  rehypeSlug,
  rehypeCodeTitles,
};
