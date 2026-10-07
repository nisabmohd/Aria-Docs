# API cheat sheet

Full docs: https://ariadocs.vercel.app/docs

## @ariadocs/mdx

| Export | Notes |
| --- | --- |
| `createDocs(config)` | `config`: `contentDir`, `remarkPlugins`, `rehypePlugins`, `components`, `blockJs` |
| `parseMdx(options)` | Returns `{ source, content, frontmatter, toc, MDX }`. `MDX` is a React element (Server Components). |
| `serializeMdx(options)` | Returns `{ source, content, frontmatter, toc, serialized }` for `MdxClient` |
| `readMdx`, `getFrontmatter`, `getToc` | Same options as `parseMdx` |
| `getNavigation({ contentDir })` | `NavItem[]` built from folders and `_meta.json` |
| `getPagePaths({ contentDir })` | `["/", "/intro", "/guides/setup"]` |
| `MdxError`, `isMdxNotFound(error)` | Error for missing pages or invalid slugs |
| `slugToTitle(slug)` | `"getting-started"` becomes `"Getting Started"` |
| `MdxServer` | `<MdxServer source remarkPlugins rehypePlugins components blockJs />`, also at `@ariadocs/mdx/server` |
| `MdxClient` | `<MdxClient serialized components />`. Import from `@ariadocs/mdx/client` in client code. |

Options are either `{ contentDir, slug }` (file) or `{ source }` (string), plus the render options.
Types: `BaseFrontmatter`, `DocsConfig`, `DocsInstance`, `DocsPageOptions`, `MdxOptions`, `ParseMdxResult`, `SerializeMdxResult`, `SerializeResult`, `MDXComponents`, `NavItem`, `TocItem`, `RemarkPlugins`, `RehypePlugins`.

`@ariadocs/mdx/plugins` exports `remarkGfm`, `rehypeSlug`, `rehypeAutolinkHeadings`, `rehypeCodeTitles`, `rehypePrism`, `rehypeCodeRaw` (after `rehypePrism`, for `Pre`'s copy button) and `remarkBlockJs`.

## @ariadocs/openapi

| Export | Notes |
| --- | --- |
| `createOpenAPI(options)` | Cached instance: `parse`, `getNavigation`, `getPagePaths`, `getOperation`, `getSchema`, `search`, `reload` |
| `parseOpenAPI({ source, allowFiles?, allowRemote? })` | Returns `APISpec` |
| `loadOpenAPI`, `validateOpenAPI`, `resolveRefs`, `normalizeOpenAPI` | The parsing steps on their own |
| `getNavigation(api, { getOperationHref? })` | One group per tag. Default links are `#id`. |
| `getPagePaths(api)` | `["/emails-send", ...]` |
| `getOperation(api, id)`, `getSchema(api, name)` | Lookup by `id` or `operationId` |
| `search(api, query, { limit? })` | Endpoints, schemas and tags |
| `createRequestSample(operation)`, `createCodeSample(sample, language)` | Languages: `curl`, `javascript`, `python`, `go`, `rust`, `java`, `kotlin`, `csharp` |
| `getServerUrl`, `getPrimaryResponse`, `getOperationTitle`, `getSchemaProperties`, `getSchemaTypeLabel`, `generateSchemaExample` | Helpers |

`APISpec` contains `operations`, `tags` and `schemas`. Types: `APISpec`, `APIOperation`, `APIParameter`, `APIRequestBody`, `APIResponse`, `APISchema`, `APITag`, `APIServer`, `APISecurityScheme`, `OpenAPIError`.

## @ariadocs/components

Styles: `@ariadocs/components/styles.css`, or `styles/theme.css` plus `styles/syntax/{default,github,nord,minimal}.css`. Dark colors apply under `.dark`.

### Docs (no client JavaScript except where noted)

| Component | Notes |
| --- | --- |
| `Docs.Layout` | Columns: sidebar, content, aside |
| `Docs.Sidebar` | Shown from `lg` up |
| `Docs.Content` | Main column |
| `Docs.Aside` | Shown from `xl` up |
| `Docs.Page`, `.Title`, `.Description`, `.Content` | `.Content` applies typography styles to rendered MDX |
| `Docs.Nav` | `items`, `activeHref`, `baseHref`, `linkAs`, `onNavigate`, `className` |
| `Docs.Toc` | `items` (`TocItem[]`) |

### OpenAPI (Client Components)

| Component | Notes |
| --- | --- |
| `OpenAPI.Root` | `api`, `operationBaseHref`. Renders nothing itself. Put it in a layout. |
| `OpenAPI.Docs` | Whole API on one page. `showSidebar`, `showSchemas`. |
| `OpenAPI.Info` | Title, version, description, base URL, auth |
| `OpenAPI.Sidebar` | `Docs.Nav` filled from the spec. `activeHref`, `linkAs`. |
| `OpenAPI.Operation` | `id` or `operation`, `headingLevel` (1-3). Parts: `.Tag`, `.Title`, `.Header`, `.Description`, `.Security`, `.Parameters`, `.RequestBody`, `.Responses`, `.RequestExample`, `.ResponseExample` |
| `OpenAPI.Schema` | `schema`. Works without `Root`. |
| `OpenAPI.Parameter`, `OpenAPI.RequestBody`, `OpenAPI.Response`, `OpenAPI.Security`, `OpenAPI.Server` | Individual parts |

Hooks: `useOpenAPI`, `useOperation`, `useParameter`, `useResponse`, `useSchema`.

### Standalone

`CodeBlock`, `CodeTabs`, `CopyButton`, `Pre` (MDX `pre` with a copy button), `Markdown`, `MethodBadge`, `cn`, `tokenize`.
