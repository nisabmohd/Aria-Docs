// ---------- Factory (Recommended) ----------
export {
  createDocs,
  type DocsInstance,
  type ParseSlugOptions,
} from "./docs.js";

// ---------- Standalone Functions ----------
export {
  // Local docs
  readMdx,
  getFrontmatter,
  getToc,
  parseMdx,
  serializeMdx,
  // Remote docs
  getFrontmatterRemote,
  getTocRemote,
  parseMdxRemote,
  serializeMdxRemote,
  // Types
  type LocalOptions,
  type RemoteOptions,
} from "./parse.js";

export {
  getNavItems,
  getPagePaths,
  slugToTitle,
  type GetNavItemsOptions,
  type GetPagePathsOptions,
} from "./nav.js";

// ---------- Components ----------
export { MdxServer } from "./components/server.js";
export { MdxClient } from "./components/client.js";

// ---------- Plugins ----------
export {
  recommendedRemarkPlugins,
  recommendedRehypePlugins,
  remarkGfm,
  rehypePrism,
  rehypeAutolinkHeadings,
  rehypeSlug,
  rehypeCodeTitles,
} from "./plugins.js";

// ---------- Types ----------
export type {
  // Core types
  BaseFrontmatter,
  DocsConfig,
  RemoteDocsConfig,
  ParseResult,
  SerializeResult,
  // Navigation types
  NavItem,
  MetaItem,
  // Plugin types
  RemarkPlugins,
  RehypePlugins,
  // Component types
  MdxServerProps,
  MdxClientProps,
  // Re-exports from external libs
  MDXComponents,
  TocItem,
} from "./types.js";
