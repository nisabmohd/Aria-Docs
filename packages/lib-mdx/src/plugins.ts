import remarkGfm from "remark-gfm"
import rehypePrism from "rehype-prism-plus"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import { SKIP, visit } from "unist-util-visit"

/* eslint-disable @typescript-eslint/no-explicit-any */

const TITLE_META = /(?:^|\s)title=(?:"([^"]*)"|'([^']*)')/

/**
 * Rehype plugin: shows a code block's file name above it, as
 * `<div class="rehype-code-title">`. Write ` ```ts title="lib/docs.ts" `,
 * or the shorter ` ```ts:lib/docs.ts `.
 */
export function rehypeCodeTitles() {
  return (tree: any) => {
    visit(tree, "element", (node: any, index: number | undefined, parent: any) => {
      if (node.tagName !== "pre" || parent === undefined || index === undefined) return undefined
      const [code] = node.children ?? []
      if (code?.tagName !== "code") return undefined

      let title: string | undefined
      const meta = code.data?.meta
      if (typeof meta === "string") {
        const match = TITLE_META.exec(meta)
        if (match) title = match[1] ?? match[2]
      }

      // `language-ts:lib/docs.ts` → class `language-ts`, title `lib/docs.ts`.
      const classNames: unknown[] = Array.isArray(code.properties?.className) ? code.properties.className : []
      code.properties = {
        ...code.properties,
        className: classNames.map((name) => {
          if (typeof name !== "string" || !name.startsWith("language-")) return name
          const separator = name.indexOf(":")
          if (separator === -1) return name
          title ??= name.slice(separator + 1)
          return name.slice(0, separator)
        }),
      }

      if (!title) return undefined
      parent.children.splice(index, 0, {
        type: "element",
        tagName: "div",
        properties: { className: ["rehype-code-title"] },
        children: [{ type: "text", value: title }],
      })
      return [SKIP, index + 2]
    })
  }
}

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

export { remarkGfm, rehypePrism, rehypeAutolinkHeadings, rehypeSlug }
