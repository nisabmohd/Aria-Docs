# Migrating from @ariadocs/react

```bash
pnpm remove @ariadocs/react
pnpm add @ariadocs/mdx @ariadocs/components
```

Then search the project for `@ariadocs/react` and apply the renames below.

| Before | After |
| --- | --- |
| `@ariadocs/react` | `@ariadocs/mdx` |
| `@ariadocs/react/client`, `/server`, `/plugins` | `@ariadocs/mdx/client`, `/server`, `/plugins` |
| `@ariadocs/react/styles/*.css` | `@ariadocs/components/styles/syntax/*.css` |
| `mdxComponents` option | `components` |
| `docs.readMdx()` | `docs.read()` |
| `docs.getNavItems()` | `docs.getNavigation()` |
| `parseMdxRemote({ raw })` | `parseMdx({ source })` |
| `serializeMdxRemote({ raw })` | `serializeMdx({ source })` |
| `getFrontmatterRemote`, `getTocRemote` | `getFrontmatter({ source })`, `getToc({ source })` |
| result field `raw` | `source` |
| `<MdxServer raw options={{ ... }} />` | `<MdxServer source remarkPlugins rehypePlugins />` |
| `<MdxClient mdxComponents />` | `<MdxClient components />` |
| `ParseResult`, `SerializeResult` | `ParseMdxResult`, `SerializeMdxResult` |

## Behavior to check after migrating

- `index.mdx` maps to its folder. `getPagePaths()` returns `"/"` and `"/guides"` instead of `"/index"` and `"/guides/index"`. Update `generateStaticParams`, prerender lists and links.
- Sidebar entries for missing files are skipped. An invalid `_meta.json` throws.
- Files and folders starting with `_` are hidden.
- TOC items are `{ value, href, depth }`. Remove any use of other fields.
- A missing page throws `MdxError`. Wrap page loading in `try/catch` with `isMdxNotFound(error)`.
- JavaScript frontmatter is refused and MDX `import`/`export` are disabled. Move components imported in MDX into the `components` option.
- Syntax themes only match `.token` elements.
- In client code, `MdxClient` must come from `@ariadocs/mdx/client`.

## @ariadocs/openapi (pre-1.0)

| Before | After |
| --- | --- |
| `openapi.parse(input, options)` | `parseOpenAPI({ source, ...options })` or `createOpenAPI({ source }).parse()` |
| `openapi.validate(input)` | `validateOpenAPI(document)` |
| `openapi.navigation(api)` | `getNavigation(api)` |
| `openapi.search(api, query)` | `search(api, query)` |
| `AriadocsOpenAPI` | `APISpec` |
| `api.groups` | `api.tags` |
| `OpenAPIParseError` | `OpenAPIError` |

## @ariadocs/components (pre-release)

| Before | After |
| --- | --- |
| `useOpenAPIContext()` | `useOpenAPI()` |
| `useOperationContext().operation` | `useOperation()` |
| `Docs.Root` | `Docs.Layout` |
| `styles/openapi.css` | `styles.css` |
