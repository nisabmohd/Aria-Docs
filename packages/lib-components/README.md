# @ariadocs/components

> shadcn-style compound components for [Aria-Docs](https://github.com/nisabmohd/Aria-Docs).
> Renders the models produced by `@ariadocs/react` and `@ariadocs/openapi` through composable `OpenAPI.*` and `Docs.*` component trees.

Headless data + shadcn primitives + compound composition. Built on [shadcn/ui](https://ui.shadcn.com) primitives (vendored into `src/ui/`), Tailwind CSS v4, and React 19.

## Install

```bash
pnpm add @ariadocs/components @ariadocs/openapi
```

Your app needs Tailwind CSS v4 configured to scan the package:

```css
@import "tailwindcss";
@source "../node_modules/@ariadocs/components/dist";
```

Then import the theme:

```ts
import "@ariadocs/components/styles/openapi.css";
```

## OpenAPI components

```tsx
import { openapi } from "@ariadocs/openapi";
import { OpenAPI } from "@ariadocs/components";

const api = await openapi.parse("./openapi.yaml");

// Level 1: complete ready-made experience
<OpenAPI.Root api={api}>
  <OpenAPI.Docs />
</OpenAPI.Root>
```

Compose your own page from the compound parts — children consume parent context, no prop drilling:

```tsx
<OpenAPI.Root api={api}>
  <OpenAPI.Layout>
    <OpenAPI.Sidebar />
    <OpenAPI.Content>
      <OpenAPI.Operation operation={operation}>
        <OpenAPI.Operation.Header>
          <OpenAPI.Operation.Method />
          <OpenAPI.Operation.Path />
        </OpenAPI.Operation.Header>
        <OpenAPI.Operation.Summary />
        <OpenAPI.Operation.Description />
        <OpenAPI.Operation.Parameters />
        <OpenAPI.Operation.RequestBody />
        <OpenAPI.Operation.Responses />
      </OpenAPI.Operation>
    </OpenAPI.Content>
  </OpenAPI.Layout>
</OpenAPI.Root>
```

Tiny primitives also work standalone — no docs site required:

```tsx
<OpenAPI.Schema schema={api.schemas.User} name="User" />
```

### Component map

| Component | Compound parts |
| --- | --- |
| `OpenAPI.Root` | provides `{ api, getOperation, getSchema, navigation, search }` via `useOpenAPIContext()` |
| `OpenAPI.Docs` | full experience (sidebar + operations + schemas) |
| `OpenAPI.Layout` | sidebar/content shell |
| `OpenAPI.Sidebar` | `.Group`, `.Item` |
| `OpenAPI.Operation` | `.Header`, `.Method`, `.Path`, `.Deprecated`, `.Summary`, `.Description`, `.Parameters`, `.RequestBody`, `.Responses`, `.Security`, `.Servers` |
| `OpenAPI.Parameter` | `.Name`, `.In`, `.Required`, `.Description`, `.Schema`, `.Example` |
| `OpenAPI.RequestBody` | `.Description`, `.Content` |
| `OpenAPI.Response` | `.Status`, `.Description`, `.Headers`, `.Content` |
| `OpenAPI.Schema` | `.Title`, `.Description`, `.Properties` |
| `OpenAPI.Code`, `OpenAPI.Example`, `OpenAPI.Security`, `OpenAPI.Server` | standalone primitives |

## Docs components

Layout primitives for MDX pages built with `@ariadocs/react`:

```tsx
import { Docs } from "@ariadocs/components";
import { MdxServer } from "@ariadocs/react/server";

<Docs.Root>
  <Docs.Layout>
    <Docs.Sidebar>{/* nav items */}</Docs.Sidebar>
    <Docs.Content>
      <Docs.Page>
        <Docs.Page.Title />
        <Docs.Page.Description />
        <Docs.Page.Content>
          <MdxServer {...props} />
        </Docs.Page.Content>
      </Docs.Page>
    </Docs.Content>
  </Docs.Layout>
</Docs.Root>
```

## Theming

Components adopt your shadcn theme tokens by default. `openapi.css` exposes `--aria-*` variables for fine-grained control:

```css
:root {
  --aria-method-get: oklch(0.63 0.17 149);
  --aria-method-post: oklch(0.58 0.19 262);
  --aria-method-delete: oklch(0.6 0.22 25);
}
```

## Architecture

```text
@ariadocs/react / @ariadocs/openapi     data (headless, no UI)
                  │
                  ▼
@ariadocs/components                     presentation
  ├── src/ui/        vendored shadcn primitives (Badge, Card, Tabs, ...)
  ├── src/openapi/   OpenAPI.* compound components
  └── src/docs/      Docs.* layout components
```

## License

MIT © [Nisab Mohd](https://github.com/nisabmohd)
