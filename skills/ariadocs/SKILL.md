---
name: ariadocs
description: Add documentation pages (MDX) and API references (OpenAPI) to a React app with the Ariadocs packages @ariadocs/mdx, @ariadocs/openapi and @ariadocs/components. Use when the user wants to set up docs, a docs sidebar or table of contents, render MDX files, render an OpenAPI/Swagger spec, build an API reference, or migrate from @ariadocs/react. Covers Next.js (App and Pages Router), React Router (v7 and v8) and TanStack Start.
---

# Ariadocs

Ariadocs turns a folder of MDX files and an OpenAPI spec into docs pages, a sidebar and an API reference. It is a set of libraries, not a framework: the app keeps its own routing and layout.

| Package | Use it for |
| --- | --- |
| `@ariadocs/mdx` | Read `.mdx` files: rendered page, frontmatter, table of contents, sidebar, static paths |
| `@ariadocs/openapi` | Parse an OpenAPI 3.0/3.1/3.2 spec into typed data |
| `@ariadocs/components` | React components for docs layouts and API references (Tailwind CSS v4) |
| `@ariadocs/core` | Shared types (`NavItem`, `TocItem`). Installed automatically. |

`@ariadocs/react` is the old name of `@ariadocs/mdx`. Never install it. To migrate an existing project, see [references/migration.md](references/migration.md).

## Workflow

1. **Inspect the project.** Find the framework and router (`next` with `app/` or `pages/`, `react-router` with `@react-router/dev`, `@tanstack/react-start`), the package manager (lockfile), the path alias (`@/`, `~/`, `#/`), and whether Tailwind v4 and shadcn/ui are set up.
2. **Install only what is needed.** MDX docs need `@ariadocs/mdx`. An API reference needs `@ariadocs/openapi`. The prebuilt UI needs `@ariadocs/components`.
3. **Create one shared instance per source** (`lib/docs.ts`, `lib/openapi.ts`). See below.
4. **Add routes** for the framework. Copy the matching recipe from [references/frameworks.md](references/frameworks.md).
5. **Set up styles** if `@ariadocs/components` is used.
6. **Add starter content**: `content/docs/index.mdx` and a `_meta.json`.
7. **Verify**: run the type check and build (or the dev server), and open `/docs` and the reference route.

## Shared instances

```ts title="lib/docs.ts"
import { createDocs } from "@ariadocs/mdx";
import {
  remarkGfm,
  rehypeSlug,
  rehypeAutolinkHeadings,
  rehypeCodeTitles,
  rehypePrism,
  rehypeCodeRaw,
} from "@ariadocs/mdx/plugins";
import { Pre } from "@ariadocs/components"; // only if @ariadocs/components is installed

export const docs = createDocs({
  contentDir: "content/docs", // relative to process.cwd()
  remarkPlugins: [remarkGfm],
  // rehypeCodeRaw must come after rehypePrism
  rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypeCodeTitles, rehypePrism, rehypeCodeRaw],
  components: { pre: Pre }, // code blocks with a copy button
});
```

```ts title="lib/openapi.ts"
import { createOpenAPI } from "@ariadocs/openapi";

// source: file path, URL, JSON/YAML string or spec object
export const openapi = createOpenAPI({ source: "./openapi.yaml" });
```

`docs` methods: `parse`, `serialize`, `read`, `getFrontmatter`, `getToc` (each takes `{ slug }`), `getNavigation()`, `getPagePaths()`.
`openapi` methods: `parse()` (cached), `getNavigation(options?)`, `getPagePaths()`, `getOperation(id)`, `getSchema(name)`, `search(query)`, `reload()`.

## Rendering: server or client

- **With React Server Components** (Next.js App Router): `const { MDX, frontmatter, toc } = await docs.parse({ slug })` and render `{MDX}` directly.
- **Without them** (Pages Router, React Router, TanStack Start): call `docs.serialize({ slug })` on the server (loader, `getStaticProps`, server function), then render `<MdxClient serialized={serialized} />` and import it from `@ariadocs/mdx/client`.
- The `OpenAPI.*` components are Client Components. They can be used from Server Components. The spec (`APISpec`) is plain data and can be passed through loaders and props.

## Styles (`@ariadocs/components`)

The components use Tailwind CSS v4 classes and shadcn/ui color tokens (`--background`, `--foreground`, `--muted`, `--border`, ...). In the main CSS file:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@source "../node_modules/@ariadocs/components/dist"; /* path relative to this CSS file */
```

Import once in the root layout or entry: `import "@ariadocs/components/styles.css";` (it includes the default syntax theme).
Other syntax themes: import `@ariadocs/components/styles/theme.css` plus one of `styles/syntax/{default,github,nord,minimal}.css`.
If the project has no shadcn/ui tokens, define those CSS variables, or initialize shadcn/ui.
Install `@tailwindcss/typography` if it is missing.

## Content and sidebar

```
content/docs/
  _meta.json
  index.mdx              -> /
  getting-started/
    _meta.json
    index.mdx            -> /getting-started
    installation.mdx     -> /getting-started/installation
```

```json title="content/docs/_meta.json"
[
  { "slug": "index", "title": "Introduction" },
  { "slug": "getting-started", "title": "Getting started" },
  { "slug": "changelog", "nav": false }
]
```

- Files missing from `_meta.json` are appended alphabetically. Entries for missing files are skipped. Invalid JSON throws.
- Names starting with `_` or `.` are hidden from the sidebar and from `getPagePaths()`.
- `getPagePaths()` returns `["/", "/getting-started", ...]`. Hrefs are relative to the docs route, so pass `baseHref="/docs"` to `Docs.Nav`.
- `docs.getNavigation()` and `openapi.getNavigation()` return the same `NavItem[]` and can be concatenated into one sidebar.

## Layout components

```tsx
import { Docs, OpenAPI } from "@ariadocs/components";

<Docs.Layout>
  <Docs.Sidebar>
    <Docs.Nav items={sidebar} baseHref="/docs" activeHref={pathname} linkAs={Link} />
  </Docs.Sidebar>
  <Docs.Content>
    <Docs.Page>
      <Docs.Page.Title>{frontmatter.title}</Docs.Page.Title>
      <Docs.Page.Description>{frontmatter.description}</Docs.Page.Description>
      <Docs.Page.Content>{MDX}</Docs.Page.Content>
    </Docs.Page>
  </Docs.Content>
  <Docs.Aside>
    <Docs.Toc items={toc} />
  </Docs.Aside>
</Docs.Layout>

<OpenAPI.Root api={api} operationBaseHref="/reference">
  <OpenAPI.Operation id="emails-send" headingLevel={1} />  {/* one endpoint */}
  {/* or <OpenAPI.Docs /> for the whole API on one page */}
</OpenAPI.Root>
```

Full component and API list: [references/api.md](references/api.md).

## Rules and gotchas

- **404s**: `docs.parse`/`serialize` throw for missing pages and for slugs outside `contentDir`. Catch the error and check `isMdxNotFound(error)`, then return the framework's 404. Rethrow anything else, such as `MDX_COMPILE_ERROR` for broken MDX, so the build fails.
- **Loader payloads**: from a loader, server function or `getStaticProps`, return `{ serialized, frontmatter, toc }`, not the whole `serialize()` result. `source` and `content` hold the raw MDX and would double the payload. Both `serialized` and `APISpec` are plain JSON.
- **Never import `@ariadocs/mdx` (main entry) in client code.** It reads files. Client code imports `MdxClient` from `@ariadocs/mdx/client`. `MdxServer` is also available from `@ariadocs/mdx/server`.
- **Functions can't cross the server/client boundary.** `Docs.Nav` with `linkAs={Link}` and `activeHref={usePathname()}` goes in a small `"use client"` wrapper. `OpenAPI.Root` takes a string `operationBaseHref` instead of a callback.
- **Endpoint pages**: `openapi.getPagePaths()` returns `["/emails-send", ...]`, so strip the leading `/` for a `[operation]` param. For sidebar links to endpoint pages, use `openapi.getNavigation({ getOperationHref: (op) => \`/reference/${op.id}\` })`, or `OpenAPI.Sidebar` inside a `Root` with `operationBaseHref`.
- **Next.js Pages Router props** must be JSON. Pass `JSON.parse(JSON.stringify(api))`.
- **TanStack Start** loaders also run in the browser, so file reads must go through `createServerFn`.
- **Untrusted content**: pass `blockJs: true` to `parseMdx`/`createDocs` for MDX from a CMS or users. For user-supplied specs, use `parseOpenAPI({ source, allowFiles: false, allowRemote: false })`. MDX `import`/`export` and JavaScript frontmatter are always disabled, so custom components go in the `components` option instead of MDX imports.
- **Custom MDX components**: pass `components` to `createDocs` (`{ Callout, pre: Pre }`). Keys that match HTML tags replace those tags. With `MdxClient`, the components run in the browser and can't be async. Passing the `OpenAPI` namespace lets MDX use `<OpenAPI.Operation id="..." />`.
- **TOC** items are `{ value, href, depth }`. Headings need `rehypeSlug` for the anchors to work.
- **Frontmatter typing**: `docs.parse<{ title: string; description?: string }>({ slug })`.
- **Sticky header**: set the CSS variable `--aria-header-height` so the sidebar and TOC sit below it.
