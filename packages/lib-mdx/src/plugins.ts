import remarkGfm from "remark-gfm"
import rehypePrism from "rehype-prism-plus"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import rehypeCodeTitles from "rehype-code-titles"
import { SKIP, visit } from "unist-util-visit"

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Rehype plugin: copies a code block's raw text onto its `<pre>` as a `raw`
 * prop, so a custom `pre` component can offer a copy button.
 */
export function rehypeCodeRaw() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (node.tagName !== "pre") return
      const [code] = node.children ?? []
      if (code?.tagName !== "code") return

      const raw = textContent(code)
      if (raw !== "") {
        node.properties = node.properties ?? {}
        node.properties.raw = raw
      }
    })
  }
}

function textContent(node: any): string {
  if (node.type === "text") return node.value ?? ""
  return (node.children ?? []).map(textContent).join("")
}

const JS_NODES = new Set(["mdxjsEsm", "mdxFlowExpression", "mdxTextExpression"])

/**
 * Remark plugin: removes JavaScript from MDX (ESM, `{expressions}` and
 * expression attributes) while keeping Markdown and plain JSX tags.
 * Applied automatically with `blockJs: true`.
 */
export function remarkBlockJs() {
  return (tree: any) => {
    visit(tree, (node: any, index: number | undefined, parent: any) => {
      if (JS_NODES.has(node.type) && parent !== undefined && index !== undefined) {
        parent.children.splice(index, 1)
        return [SKIP, index]
      }
      if ((node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && Array.isArray(node.attributes)) {
        node.attributes = node.attributes.filter(
          (attribute: any) =>
            attribute.type === "mdxJsxAttribute" &&
            (attribute.value === null || attribute.value === undefined || typeof attribute.value === "string")
        )
      }
      return undefined
    })
  }
}

export { remarkGfm, rehypePrism, rehypeAutolinkHeadings, rehypeSlug, rehypeCodeTitles }
