# OpenAPI components

All parts are Client Components that take plain data. `api` comes from `openapi.parse()` (`@ariadocs/openapi`).

`OpenAPI.Root` is required for `OpenAPI.Docs`, `OpenAPI.Info`, `OpenAPI.Sidebar` and for lookups by `id` or `name`. Parts given their data directly (`operation={op}`, `schema={schema}`, `parameter={p}`, `response={r}`) work without it.

## Parts

| Component | Props | Children parts |
| --- | --- | --- |
| `OpenAPI.Root` | `api`, `operationBaseHref?` (e.g. `"/reference"` → `/reference/<id>`; without it, `#id` anchors) | anything |
| `OpenAPI.Docs` | `showSidebar?`, `showSchemas?` | — (whole API on one page) |
| `OpenAPI.Info` | `className?` | — |
| `OpenAPI.Sidebar` | `activeHref?`, `linkAs?`, `onNavigate?` | — |
| `OpenAPI.Operation` | `id?` or `operation?`, `headingLevel?` (1–3) | `.Tag`, `.Title` (`level`), `.Header`, `.Method`, `.Path`, `.Deprecated`, `.Summary`, `.Description`, `.Security`, `.Parameters`, `.RequestBody`, `.Responses`, `.Examples`, `.RequestExample` (`languages`), `.ResponseExample` |
| `OpenAPI.Parameter` | `parameter?` | `.Header`, `.Name`, `.In`, `.Required`, `.Description`, `.Details`, `.Schema`, `.Example` |
| `OpenAPI.RequestBody` | `requestBody?` | `.Description`, `.Content` |
| `OpenAPI.Response` | `response?` | `.Status`, `.Description`, `.Headers`, `.Content` |
| `OpenAPI.Schema` | `name?` or `schema?`, `mode?` (`"request"` hides readOnly, `"response"` hides writeOnly) | `.Title` (`id`), `.Description`, `.Properties` |
| `OpenAPI.Security` | `security?` | — |
| `OpenAPI.Server` | `servers?` | — |
| `OpenAPI.Method` | `method`, `size?`, `variant?` (`badge`, `text`) | — |
| `OpenAPI.Code` | `code`, `language?`, `title?`, `actions?` | — |
| `OpenAPI.Markdown` | `children` (string) | — |

Without children, each component renders its full default layout. With children, it renders only the parts you list, in your order, and you can put your own elements between them.

## Recipes

Endpoint page without code examples:

```tsx
<OpenAPI.Operation id={id} headingLevel={1}>
  <OpenAPI.Operation.Title level={1} />
  <OpenAPI.Operation.Header />
  <OpenAPI.Operation.Description />
  <OpenAPI.Operation.Parameters />
  <OpenAPI.Operation.RequestBody />
  <OpenAPI.Operation.Responses />
</OpenAPI.Operation>
```

Only some request languages: `<OpenAPI.Operation.RequestExample languages={["curl", "javascript"]} />` (see `CODE_SAMPLE_LANGUAGES` from `@ariadocs/openapi` for ids).

A schema page:

```tsx
<OpenAPI.Root api={api}>
  {Object.keys(api.schemas).map((name) => (
    <OpenAPI.Schema key={name} name={name}>
      <OpenAPI.Schema.Title id={`schema-${name}`} />
      <OpenAPI.Schema.Properties />
    </OpenAPI.Schema>
  ))}
</OpenAPI.Root>
```

Your own part, using a hook inside the matching component:

```tsx
"use client"
import { useOperation } from "@ariadocs/components"

export function OperationId() {
  return <code className="text-muted-foreground text-xs">{useOperation().operationId}</code>
}
```

Hooks: `useOpenAPI()` (inside `Root`), `useOperation()`, `useParameter()`, `useResponse()`, `useSchema()`.

## Sidebar for endpoint pages

Either `<OpenAPI.Sidebar />` inside `Root` with `operationBaseHref`, or build `NavItem[]` and use `Docs.Nav` (lets you merge it with MDX docs):

```ts
const nav = await openapi.getNavigation({ getOperationHref: (op) => `/reference/${op.id}` })
```
