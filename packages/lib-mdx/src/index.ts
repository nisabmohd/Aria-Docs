// ---------- Factory ----------
export { createDocs, type DocsConfig, type DocsInstance, type DocsPageOptions } from "./docs.js"

// ---------- Functions ----------
export { parseMdx, serializeMdx, readMdx, getFrontmatter, getToc } from "./parse.js"
export { getNavigation, getPagePaths } from "./nav.js"
export { MdxError, isMdxNotFound, type MdxErrorCode } from "./errors.js"
export { slugToTitle } from "@ariadocs/core"

// ---------- Components ----------
export { MdxServer } from "./components/server.js"
// `MdxClient` is also available here for Server Components that pass it
// along; inside Client Components import it from "@ariadocs/mdx/client".
export { MdxClient } from "./components/client.js"

// ---------- Types ----------
export type {
  BaseFrontmatter,
  MdxOptions,
  MdxFileSource,
  MdxStringSource,
  MdxRenderOptions,
  ContentDirOptions,
  ParseMdxResult,
  SerializeMdxResult,
  MdxServerProps,
  MdxClientProps,
  RemarkPlugins,
  RehypePlugins,
  MDXComponents,
  NavItem,
  TocItem,
  SerializeResult,
} from "./types.js"
