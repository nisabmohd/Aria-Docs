import { createDocs, type DocsConfig } from "@ariadocs/mdx"
import {
  rehypeAutolinkHeadings,
  rehypeCodeRaw,
  rehypeCodeTitles,
  rehypePrism,
  rehypeSlug,
  remarkGfm,
} from "@ariadocs/mdx/plugins"
import { createOpenAPI } from "@ariadocs/openapi"
import { mdxComponents } from "@/components/mdx"

const shared: Omit<DocsConfig, "contentDir"> = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    [rehypeAutolinkHeadings, { behavior: "wrap" }],
    rehypeCodeTitles,
    rehypePrism,
    rehypeCodeRaw,
  ],
  components: mdxComponents,
}

/** Guides and API docs for the libraries (`/docs`). */
export const docs = createDocs({ contentDir: "contents/docs", ...shared })

/** Component documentation with live demos (`/components`). */
export const componentDocs = createDocs({ contentDir: "contents/components", ...shared })

/** Resend's public OpenAPI spec (MIT), rendered in the API reference (`/reference`). */
export const openapi = createOpenAPI({
  source: "contents/openapi/resend.yaml",
  // The source is a trusted file in this repo; never fetch or read anything else.
  allowRemote: false,
})

/** A test fixture with every case the components render (`/components/openapi/edge-cases`). */
export const edgeCases = createOpenAPI({
  source: "contents/openapi/edge-cases.yaml",
  allowRemote: false,
})

export const REFERENCE_BASE = "/reference"
