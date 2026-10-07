---
name: ariadocs-openapi
description: Build an API reference from an OpenAPI 3.0/3.1/3.2 spec with @ariadocs/openapi — parse and validate a spec from a file, URL or object, list operations, tags and schemas, build sidebar navigation and per-endpoint static paths, generate code samples, search, and handle untrusted specs. Use when the user wants an API reference, endpoint pages, a spec-driven sidebar, request code samples, or to read an OpenAPI spec in React. Covers Next.js (App and Pages Router), React Router (v7 and v8) and TanStack Start. For rendering and customizing the reference UI use the `ariadocs-components` skill.
---

# @ariadocs/openapi

Parses an OpenAPI spec into one typed, plain-JSON model (`APISpec`): operations, tags and schemas with `$ref`s resolved. The model can be passed through loaders and props. `@ariadocs/components` renders it with the `OpenAPI.*` components.

Related skills: `ariadocs-components` covers the `OpenAPI.*` parts and the page shell. `ariadocs-mdx` adds MDX guides next to the reference.

## Workflow

1. **Inspect the project**: framework and router, package manager, path alias, and where the spec lives (file in the repo, URL, or generated).
2. **Install** `@ariadocs/openapi`, plus `@ariadocs/components` for the UI (then follow the `ariadocs-components` skill for styles).
3. **Create one shared instance** in `lib/openapi.ts` (below).
4. **Add routes**: copy the matching recipe from [references/frameworks.md](references/frameworks.md). Choose one page per endpoint (`/reference/[operation]`) or the whole API on one page.
5. **Verify**: type check and build, open the reference route and one endpoint page.

## Shared instance

```ts title="lib/openapi.ts"
import { createOpenAPI } from "@ariadocs/openapi";

// source: file path, URL, JSON/YAML string or spec object
export const openapi = createOpenAPI({ source: "./openapi.yaml" });
```

`openapi` methods: `parse()` (cached), `getNavigation(options?)`, `getPagePaths()`, `getOperation(id)`, `getSchema(name)`, `search(query)`, `reload()`.

## Rendering

```tsx
const api = await openapi.parse();

// Whole API on one page
<OpenAPI.Root api={api}><OpenAPI.Docs /></OpenAPI.Root>

// One page per endpoint
<OpenAPI.Root api={api} operationBaseHref="/reference">
  <OpenAPI.Operation id={operation} headingLevel={1} />
</OpenAPI.Root>
```

The `OpenAPI.*` components are Client Components that take plain data, so Server Components can render them. To pick parts, reorder or add your own, see the `ariadocs-components` skill.

Full export list: [references/api.md](references/api.md).

## Rules and gotchas

- **Endpoint pages**: `openapi.getPagePaths()` returns `["/emails-send", ...]`, so strip the leading `/` for an `[operation]` param. Operation ids come from `operationId`, or are derived from method and path.
- **Sidebar links**: `openapi.getNavigation({ getOperationHref: (op) => \`/reference/${op.id}\` })` returns `NavItem[]` (one group per tag, with method badges) for `Docs.Nav`. It has the same shape as `docs.getNavigation()` from `@ariadocs/mdx`, so they can be merged into one sidebar. Or use `<OpenAPI.Sidebar />` inside a `Root` with `operationBaseHref`.
- **`operationBaseHref` is a string**, not a callback, so `OpenAPI.Root` works from Server Components.
- **Next.js Pages Router props** must be JSON. Pass `JSON.parse(JSON.stringify(api))`. For large specs pass only the operation and render `<OpenAPI.Operation operation={operation} />` without `Root`.
- **TanStack Start** loaders also run in the browser, so `openapi.parse()` must go through `createServerFn`.
- **Untrusted specs**: for user-supplied specs, use `parseOpenAPI({ source, allowFiles: false, allowRemote: false })`. Use `allowRemote: false` for trusted local files too, so `$ref`s can't fetch.
- **Errors**: parsing throws `OpenAPIError` for invalid specs. Let it fail the build. Swagger 2.0 is rejected: convert it to OpenAPI 3 first (for example with `swagger2openapi`).
- **Code samples**: `createRequestSample(operation)` plus `createCodeSample(sample, language)` for `curl`, `javascript`, `python`, `go`, `rust`, `java`, `kotlin`, `csharp`. `OpenAPI.Operation.RequestExample` uses them.
- **Migrating** from pre-1.0 APIs: see [references/migration.md](references/migration.md).
