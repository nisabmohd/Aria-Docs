import type { MDXComponents } from "@ariadocs/mdx"
import { CodeBlock, Docs, Markdown, MethodBadge, OpenAPI, Pre } from "@ariadocs/components"
import { Callout, Card, Cards } from "./callout"
import { ClientParseDemo } from "./demos/client-parse-demo"
import { ApiPreview, EdgeCasePreview, Preview } from "./demos/preview"
import { Install, Tab, Tabs } from "./install"
import { MdxLink } from "./mdx-link"

/**
 * Components available in server-rendered MDX (live demos included).
 * `OpenAPI` and `Docs` are namespaces (`<OpenAPI.Operation />`), which MDX
 * supports but `MDXComponents`' types don't model, hence the cast.
 */
export const mdxComponents = {
  table: (props: React.ComponentProps<"table">) => (
    <div className="my-6 w-full overflow-x-auto">
      <table {...props} />
    </div>
  ),
  a: MdxLink,
  pre: Pre,
  Callout,
  Install,
  Tabs,
  Tab,
  Cards,
  Card,
  Preview,
  ApiPreview,
  EdgeCasePreview,
  ClientParseDemo,
  OpenAPI,
  Docs,
  CodeBlock,
  Markdown,
  MethodBadge,
} as unknown as MDXComponents
