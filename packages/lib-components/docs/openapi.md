# OpenAPI components

Render an API reference from `@ariadocs/openapi`. The parts are Client Components that take plain data, so Server Components can render them.

`OpenAPI.Root` is required for `OpenAPI.Docs`, `OpenAPI.Info`, `OpenAPI.Sidebar`, and for looking items up by `id` or `name`. Parts given their data directly (`<OpenAPI.Operation operation={op} />`, `<OpenAPI.Schema schema={schema} />`) also work without it.

```tsx
import { OpenAPI } from "@ariadocs/components"
import { openapi } from "@/lib/openapi" // createOpenAPI({ source: "./openapi.yaml" })

const api = await openapi.parse()
```

## The whole API on one page

```tsx
<OpenAPI.Root api={api}>
  <OpenAPI.Docs />
</OpenAPI.Root>
```

`OpenAPI.Docs` props: `showSidebar` (default `true`), `showSchemas` (default `true`), `className`.

## One page per operation

```tsx
<OpenAPI.Root api={api} operationBaseHref="/reference">
  <OpenAPI.Operation id="listPets" headingLevel={1} />
</OpenAPI.Root>
```

- `operationBaseHref` turns operation links into `/reference/<id>`. Without it they're `#id` anchors.
- Static paths come from `openapi.getPagePaths()` (`["/listPets", ...]`). Strip the leading `/` for a `[operation]` param.
- Sidebar links come from `openapi.getNavigation({ getOperationHref: (op) => \`/reference/${op.id}\` })` passed to `Docs.Nav`, or from `<OpenAPI.Sidebar />` inside `Root`.
- Inside `Docs.Layout`, return only `Docs.Content` (no `Docs.Aside`), and the layout drops the TOC column.

## Compose an operation from parts

```tsx
<OpenAPI.Operation id="listPets">
  <OpenAPI.Operation.Tag />
  <OpenAPI.Operation.Title level={1} />
  <OpenAPI.Operation.Header />        {/* method + full URL, with copy */}
  <OpenAPI.Operation.Description />
  <OpenAPI.Operation.Security />
  <OpenAPI.Operation.Parameters />
  <OpenAPI.Operation.RequestBody />
  <OpenAPI.Operation.Responses />
  <OpenAPI.Operation.Examples />      {/* request + response examples side by side */}
</OpenAPI.Operation>
```

## Reference

| Component | Props |
| --- | --- |
| `OpenAPI.Root` | `api` (from `openapi.parse()`), `operationBaseHref?`, `children` |
| `OpenAPI.Docs` | `showSidebar?`, `showSchemas?`, `className?` |
| `OpenAPI.Info` | `className?` |
| `OpenAPI.Sidebar` | `activeHref?`, `linkAs?`, `onNavigate?`, `className?` |
| `OpenAPI.Operation` | `id?` or `operation?`, `headingLevel?` (1–3, default 2), `children?`, `className?` |
| `OpenAPI.Operation.Title` | `level?` (1–3) |
| `OpenAPI.Operation.RequestExample` | `languages?` (`CodeSampleLanguage[]`, default cURL, JavaScript, Python) |
| `OpenAPI.Operation.Responses` | `responses?` (defaults to the operation's) |
| `OpenAPI.Parameter` | `parameter?`, `children?`, `className?` |
| `OpenAPI.RequestBody` | `requestBody?` (defaults to the operation's), `children?`, `className?` |
| `OpenAPI.Response` | `response?`, `children?`, `className?` |
| `OpenAPI.Schema` | `name?` (component schema key) or `schema?`, `mode?` (`"request"` hides readOnly, `"response"` hides writeOnly), `children?` |
| `OpenAPI.Schema.Title` | `id?` (anchor) |
| `OpenAPI.Security` | `security?` (defaults to the operation's, else the API's) |
| `OpenAPI.Server` | `servers?` (defaults to the operation's, else the API's) |
| `OpenAPI.Method` | `method`, `size?` (`sm`, `md`), `variant?` (`badge`, `text`) |
| `OpenAPI.Code` | `code`, `language?`, `title?`, `actions?` |
| `OpenAPI.Markdown` | `children` (string) |

All other parts take only `className` and read the current item from context.

## Your own parts

Use the hooks inside the matching component:

```tsx
"use client"
import { useOperation } from "@ariadocs/components"

export function OperationId() {
  return <code>{useOperation().id}</code>
}
```

`useOpenAPI()` inside `Root`, `useOperation()` inside `Operation`, `useParameter()` inside `Parameter`, `useResponse()` inside `Response`, `useSchema()` inside `Schema`.

## MDX

Pass the namespace to `createDocs({ components: { OpenAPI } })` to use `<OpenAPI.Operation id="..." />` in MDX. Wrap the page in `OpenAPI.Root`.
