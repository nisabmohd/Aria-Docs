---
name: ariadocs-mdx
description: Add MDX documentation pages to a React app with @ariadocs/mdx — read a folder of .mdx files, render pages (Server Components or client), frontmatter, table of contents, sidebar navigation from _meta.json, static paths, remark/rehype plugins, custom MDX components and untrusted MDX. Use when the user wants to set up docs pages, render MDX files or MDX from a CMS, build a docs sidebar or TOC, or migrate from @ariadocs/react. Covers Next.js (App and Pages Router), React Router (v7 and v8) and TanStack Start. For the UI (layout, sidebar, callouts) use the `ariadocs-components` skill; for API references use `ariadocs-openapi`.
---

# @ariadocs/mdx

Turns a folder of MDX files into rendered pages, frontmatter, a table of contents, a sidebar tree and static paths. It is a library, not a framework: the app keeps its own routing and layout.

Related skills: `ariadocs-components` renders the page shell, sidebar and TOC, and has copy-paste Callout, Tabs, Steps and Cards. `ariadocs-openapi` adds an API reference. `@ariadocs/core` (shared `NavItem`/`TocItem` types) is installed automatically.

`@ariadocs/react` is the old name of `@ariadocs/mdx`. Never install it. To migrate, see [references/migration.md](references/migration.md).

## Workflow

1. **Inspect the project.** Find the framework and router (`next` with `app/` or `pages/`, `react-router` with `@react-router/dev`, `@tanstack/react-start`), the package manager (lockfile) and the path alias (`@/`, `~/`, `#/`).
2. **Install** `@ariadocs/mdx`. Add `@ariadocs/components` for the prebuilt UI (then follow the `ariadocs-components` skill for styles).
3. **Create one shared instance** in `lib/docs.ts` (below).
4. **Add routes** for the framework. Copy the matching recipe from [references/frameworks.md](references/frameworks.md).
5. **Add starter content**: `content/docs/index.mdx` and a `_meta.json`.
6. **Verify**: run the type check and build (or the dev server), and open `/docs`.

## Shared instance

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
  components: { pre: Pre }, // code blocks with a copy button; add Callout, Tabs, ... here
});
```

`docs` methods: `parse`, `serialize`, `read`, `getFrontmatter`, `getToc` (each takes `{ slug }`), `getNavigation()`, `getPagePaths()`.

## Rendering: server or client

- **With React Server Components** (Next.js App Router): `const { MDX, frontmatter, toc } = await docs.parse({ slug })` and render `{MDX}` directly.
- **Without them** (Pages Router, React Router, TanStack Start): call `docs.serialize({ slug })` on the server (loader, `getStaticProps`, server function), then render `<MdxClient serialized={serialized} components={...} />` imported from `@ariadocs/mdx/client`.

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
- `docs.getNavigation()` returns `NavItem[]`, the same shape as `openapi.getNavigation()`, so the two can be concatenated into one sidebar.
- The ordered `NavItem[]` tree is also what you flatten for previous/next links and breadcrumbs.

Full export list: [references/api.md](references/api.md).

## Rules and gotchas

- **404s**: `docs.parse`/`serialize` throw for missing pages and for slugs outside `contentDir`. Catch the error and check `isMdxNotFound(error)`, then return the framework's 404. Rethrow anything else, such as `MDX_COMPILE_ERROR` for broken MDX, so the build fails.
- **Loader payloads**: from a loader, server function or `getStaticProps`, return `{ serialized, frontmatter, toc }`, not the whole `serialize()` result. `source` and `content` hold the raw MDX and would double the payload.
- **Never import `@ariadocs/mdx` (main entry) in client code.** It reads files. Client code imports `MdxClient` from `@ariadocs/mdx/client`. `MdxServer` is also available from `@ariadocs/mdx/server`.
- **Next.js Pages Router props** must be JSON.
- **TanStack Start** loaders also run in the browser, so file reads must go through `createServerFn`.
- **Untrusted content**: pass `blockJs: true` to `parseMdx`/`createDocs` for MDX from a CMS or users. MDX `import`/`export` and JavaScript frontmatter are always disabled.
- **Custom MDX components**: MDX files can't import, so pass components to `createDocs({ components })` (or the `components` prop of `MdxServer`/`MdxClient`). Keys that match HTML tags replace those tags. With `MdxClient`, the components run in the browser and can't be async. Callout, Tabs, Steps and Cards are not in any package: copy them from the `ariadocs-components` skill.
- **TOC** items are `{ value, href, depth }`. Headings need `rehypeSlug` for the anchors to work.
- **Frontmatter typing**: `docs.parse<{ title: string; description?: string }>({ slug })`.
