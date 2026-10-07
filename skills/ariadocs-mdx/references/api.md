# API cheat sheet

Full docs: https://ariadocs.vercel.app/docs/mdx

| Export | Notes |
| --- | --- |
| `createDocs(config)` | `config`: `contentDir`, `remarkPlugins`, `rehypePlugins`, `components`, `blockJs` |
| `parseMdx(options)` | Returns `{ source, content, frontmatter, toc, MDX }`. `MDX` is a React element (Server Components). |
| `serializeMdx(options)` | Returns `{ source, content, frontmatter, toc, serialized }` for `MdxClient` |
| `readMdx`, `getFrontmatter`, `getToc` | Same options as `parseMdx` |
| `getNavigation({ contentDir })` | `NavItem[]` built from folders and `_meta.json` |
| `getPagePaths({ contentDir })` | `["/", "/intro", "/guides/setup"]` |
| `MdxError`, `isMdxNotFound(error)` | Codes: `MDX_NOT_FOUND`, `MDX_INVALID_SLUG` (both 404), `MDX_INVALID_META`, `MDX_COMPILE_ERROR` |
| `slugToTitle(slug)` | `"getting-started"` becomes `"Getting Started"` |
| `MdxServer` | `<MdxServer source remarkPlugins rehypePlugins components blockJs />`, also at `@ariadocs/mdx/server` |
| `MdxClient` | `<MdxClient serialized components />`. Import from `@ariadocs/mdx/client` in client code. |

Options are either `{ contentDir, slug }` (file) or `{ source }` (string), plus the render options.
Types: `BaseFrontmatter`, `DocsConfig`, `DocsInstance`, `DocsPageOptions`, `MdxOptions`, `ParseMdxResult`, `SerializeMdxResult`, `SerializeResult`, `MDXComponents`, `NavItem`, `TocItem`, `RemarkPlugins`, `RehypePlugins`.

`@ariadocs/mdx/plugins` exports `remarkGfm`, `rehypeSlug`, `rehypeAutolinkHeadings`, `rehypeCodeTitles`, `rehypePrism`, `rehypeCodeRaw` (after `rehypePrism`, for `Pre`'s copy button) and `remarkBlockJs`.
