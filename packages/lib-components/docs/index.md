# @ariadocs/components

React components for docs pages (`Docs.*`) and API references (`OpenAPI.*`). They render what `@ariadocs/mdx` and `@ariadocs/openapi` return. Tailwind CSS v4 and shadcn/ui color tokens.

These files ship with the package at `node_modules/@ariadocs/components/docs/`:

- [index.md](index.md): every export, what's not included, and setup (this file)
- [docs-layout.md](docs-layout.md): `Docs.*` layout, with recipes for Next.js App Router and other frameworks
- [openapi.md](openapi.md): `OpenAPI.*` API reference components

## Not included

The package does **not** ship MDX content components. There is no `Callout`, `Tabs`, `Steps`, `Cards`, `Accordion` or `Badge` for use inside MDX. Write your own and pass them through the `components` option of `createDocs` (or `MdxServer` / `MdxClient`):

```tsx
// components/callout.tsx
export function Callout({ type = "note", children }: { type?: "note" | "warning"; children: React.ReactNode }) {
  return <div data-type={type} className="not-prose my-6 rounded-lg border px-4 py-3 text-sm">{children}</div>
}

// lib/docs.ts
export const docs = createDocs({ contentDir: "content/docs", components: { Callout, pre: Pre } })
```

Also not included: a site header, search, a theme toggle, breadcrumbs and previous/next page links. Build them in your app. `getNavigation()` returns the ordered `NavItem[]` tree you need for breadcrumbs and previous/next links.

## Setup

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@source "../node_modules/@ariadocs/components/dist"; /* relative to this CSS file */
```

```ts
import "@ariadocs/components/styles.css" // once, in the root layout
```

Other syntax themes: import `@ariadocs/components/styles/theme.css` and one of `styles/syntax/{default,github,nord,minimal}.css`.

## Every export

### `Docs` namespace (layout and navigation, see [docs-layout.md](docs-layout.md))

| Export | Kind | What it is for |
| --- | --- | --- |
| `Docs.Layout` | server | The page grid. Columns appear only for the slots that are direct children. |
| `Docs.Sidebar` | server | Sticky left column, shown from `lg`. Holds `Docs.Nav`. |
| `Docs.MobileNav` | client | Menu button and left drawer for the nav below `lg`. Closes on link click. |
| `Docs.Content` | server | Main column (`<main>`). Holds `Docs.Page` or `OpenAPI.*`. |
| `Docs.Aside` | server | Sticky right column, shown from `xl`. Holds `Docs.Toc`. Leave it out and the column disappears. |
| `Docs.Nav` | client | Sidebar links from `docs.getNavigation()` / `openapi.getNavigation()`. |
| `Docs.Toc` | client | "On this page" list from `toc`. Highlights the heading in view. |
| `Docs.Page` | server | One page (`<article>`, max width 3xl). |
| `Docs.Page.Title` | server | `<h1>`, usually `frontmatter.title`. |
| `Docs.Page.Description` | server | Muted lead paragraph, usually `frontmatter.description`. |
| `Docs.Page.Content` | server | Wraps rendered MDX with Tailwind Typography styles. |

### `OpenAPI` namespace (see [openapi.md](openapi.md))

| Export | What it is for |
| --- | --- |
| `OpenAPI.Root` | Provides the parsed spec to everything inside. Required for `Docs`, `Info`, `Sidebar` and lookups by `id`/`name`. |
| `OpenAPI.Docs` | A complete single-page reference: info, all operations by tag, schemas. |
| `OpenAPI.Info` | API title, version, description, servers, auth and links. |
| `OpenAPI.Sidebar` | Tags and their operations as a nav (same look as `Docs.Nav`). |
| `OpenAPI.Operation` | One endpoint. Children: `.Tag`, `.Title`, `.Header`, `.Method`, `.Path`, `.Deprecated`, `.Summary`, `.Description`, `.Security`, `.Parameters`, `.RequestBody`, `.Responses`, `.Examples`, `.RequestExample`, `.ResponseExample`. |
| `OpenAPI.Parameter` | One parameter row. Children: `.Header`, `.Name`, `.In`, `.Required`, `.Description`, `.Details`, `.Schema`, `.Example`. |
| `OpenAPI.RequestBody` | The request body. Children: `.Description`, `.Content`. |
| `OpenAPI.Response` | One response. Children: `.Status`, `.Description`, `.Headers`, `.Content`. |
| `OpenAPI.Schema` | A schema tree, by `name` or `schema`. Children: `.Title`, `.Description`, `.Properties`. |
| `OpenAPI.Security` | How to authenticate. |
| `OpenAPI.Server` | Base URLs. |
| `OpenAPI.Method` | Same as `MethodBadge`. |
| `OpenAPI.Code` | Same as `CodeBlock`. |
| `OpenAPI.Markdown` | Same as `Markdown`. |

### Standalone components

| Export | What it is for |
| --- | --- |
| `Pre` | Drop-in `pre` for MDX with a copy button: `components: { pre: Pre }`. Pair with `rehypeCodeRaw`. |
| `CodeBlock` | A code block with a header, highlighting (`json`, `bash`, `javascript`, `python`) and copy. |
| `CodeTabs` | Underlined tabs for a `CodeBlock` header (`actions` prop). Not general-purpose content tabs. |
| `CopyButton` | Copy-to-clipboard button. |
| `Markdown` | Safe renderer for the small Markdown subset in API descriptions. Not for MDX pages. |
| `MethodBadge` | Colored HTTP method label. |

### Hooks (inside `OpenAPI.Root`)

`useOpenAPI()` (the spec and options), `useOperation()`, `useParameter()`, `useResponse()`, `useSchema()`: read the current item inside the matching `OpenAPI.*` component, to build your own parts.

### Utilities

`cn(...classes)` (clsx + tailwind-merge), `tokenize(code, language)` (the highlighter used by `CodeBlock`).

### Types

`DocsNavProps`, `DocsTocProps`, `DocsMobileNavProps`, `LinkComponentProps`, `CodeBlockProps`, `CodeTabsProps`, `CopyButtonProps`, `PreProps`, `MarkdownProps`, `MethodBadgeProps`, `OpenAPIContextValue`, `OpenAPIRootProps`, `OpenAPIDocsProps`, `OpenAPIOperationProps`, `OpenAPIParameterProps`, `OpenAPIRequestBodyProps`, `OpenAPIResponseProps`, `OpenAPISchemaProps`, `SchemaMode`, `OpenAPISecurityProps`, `OpenAPIServerProps`, `OpenAPISidebarProps`, `Token`.

## CSS variables

| Variable | Default | Used by |
| --- | --- | --- |
| `--aria-header-height` | `0px` | Sticky offset of `Docs.Sidebar` and `Docs.Aside` below your site header |
| `--aria-docs-max-width` | `90rem` | Max width of `Docs.Layout` |
| `--aria-sidebar-width` | `17rem` | Width of the `Docs.Sidebar` column |
| `--aria-toc-width` | `15rem` | Width of the `Docs.Aside` column |
| `--aria-accent` | `var(--primary)` | Active nav and TOC items |
| `--aria-text-*`, `--aria-method-*`, `--aria-status-*`, `--aria-code-background` | see `styles/theme.css` | Type scale and colors |
