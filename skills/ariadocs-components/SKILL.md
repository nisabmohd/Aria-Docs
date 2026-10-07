---
name: ariadocs-components
description: Build and customize docs UI with @ariadocs/components — the Docs.* layout (sidebar, mobile nav, table of contents, page), the OpenAPI.* API reference parts, theming with --aria-* CSS variables, and MDX content components such as Callout, Tabs, Steps and Cards (which the package does not include). Use when the user wants to change a docs layout, add a mobile menu, hide or reorder parts of an endpoint page, theme the components, add callouts/tabs/steps/cards to MDX, or compose custom API reference pages. For loading MDX content use the `ariadocs-mdx` skill; for parsing OpenAPI specs and reference routes use `ariadocs-openapi`.
---

# @ariadocs/components

React components that render what `@ariadocs/mdx` and `@ariadocs/openapi` return. Two namespaces: `Docs.*` for the page shell and MDX pages, and `OpenAPI.*` for API references. They use Tailwind CSS v4 and shadcn/ui color tokens. Fonts and colors come from the app.

The installed package ships its full docs at `node_modules/@ariadocs/components/docs/` (`index.md` lists every export). Read it when a detail is missing here. The `.d.ts` files also have a doc comment with an example on each component.

## Setup

```bash
pnpm add @ariadocs/components
```

The components use Tailwind CSS v4 and shadcn/ui color tokens. In the main CSS file:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@source "../node_modules/@ariadocs/components/dist"; /* path relative to this CSS file */
```

Import the styles once in the root layout or entry: `import "@ariadocs/components/styles.css";` (it includes the default syntax theme). Install `@tailwindcss/typography` if it is missing. If the project has no shadcn/ui tokens (`--background`, `--foreground`, `--muted`, `--border`, `--primary`, ...), define them or initialize shadcn/ui.

## What's included and what isn't

| Included | Not included: write it in the app |
| --- | --- |
| Page shell: `Docs.Layout`, `Docs.Sidebar`, `Docs.MobileNav`, `Docs.Content`, `Docs.Aside` | Site header, logo, search, theme toggle |
| `Docs.Nav` (sidebar links), `Docs.Toc` (on this page) | Breadcrumbs, previous/next page links |
| `Docs.Page` with `.Title`, `.Description`, `.Content` (prose styles) | **MDX content components: `Callout`, `Tabs`, `Steps`, `Cards`, `Accordion`, `Badge`** |
| `Pre` (MDX code block with copy), `CodeBlock`, `CodeTabs`, `CopyButton` | Package-manager install tabs |
| `OpenAPI.*`: full reference or composable endpoint, parameter, body, response and schema parts | |

For the MDX components, copy the ready-made versions in [references/mdx-components.md](references/mdx-components.md) into the app and register them. Don't search the package for them.

## Page shell: use `Docs.Layout`, never a hand-written grid

`Docs.Layout` adds a column only for the slots present as **direct children**:

- `Docs.Sidebar`: left column, shown from `lg`.
- `Docs.Content`: main column.
- `Docs.Aside`: right column, shown from `xl`, only when it renders something. A page with no TOC (an API endpoint page, for example) gets the full width. No `col-span` workarounds are needed.

Don't wrap the slots in a `div` or in a component that renders its own element. That breaks the grid.

### Next.js App Router split

The sidebar goes in `layout.tsx`. The page returns content and TOC **as a fragment**:

```tsx
// app/docs/layout.tsx (Server Component)
const nav = await docs.getNavigation()
return (
  <>
    <header className="bg-background sticky top-0 z-40 flex h-14 items-center gap-2 border-b px-4">
      <Docs.MobileNav>
        <Nav items={nav} />
      </Docs.MobileNav>
      {/* logo, search, theme toggle */}
    </header>
    <Docs.Layout>
      <Docs.Sidebar>
        <Nav items={nav} />
      </Docs.Sidebar>
      {children}
    </Docs.Layout>
  </>
)

// app/docs/[[...slug]]/page.tsx
return (
  <>
    <Docs.Content>
      <Docs.Page>
        <Docs.Page.Title>{frontmatter.title}</Docs.Page.Title>
        {frontmatter.description && <Docs.Page.Description>{frontmatter.description}</Docs.Page.Description>}
        <Docs.Page.Content>{MDX}</Docs.Page.Content>
      </Docs.Page>
    </Docs.Content>
    <Docs.Aside>
      <Docs.Toc items={toc} />
    </Docs.Aside>
  </>
)
```

```tsx
// app/docs/nav.tsx: linkAs and usePathname need a Client Component
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Docs } from "@ariadocs/components"
import type { NavItem } from "@ariadocs/core"

export function Nav({ items }: { items: NavItem[] }) {
  return <Docs.Nav items={items} baseHref="/docs" activeHref={usePathname()} linkAs={Link} />
}
```

Other frameworks (one route component renders everything): put `Docs.Sidebar`, `Docs.Content` and `Docs.Aside` in a single `Docs.Layout` tree.

### Mobile

`Docs.Sidebar` is hidden below `lg`. Always add `Docs.MobileNav` with the same nav, usually in the header. Its button hides from `lg`, and the drawer closes when a link inside is clicked. Props: `title` (accessible name, default "Navigation"), `trigger` (button contents), `open` and `onOpenChange` (controlled), `triggerClassName`, `className`.

### Sizes

Set CSS variables instead of overriding classes:

```css
:root {
  --aria-header-height: 3.5rem;  /* sticky header height; sidebar and TOC stick below it */
  --aria-docs-max-width: 96rem;  /* default 90rem */
  --aria-sidebar-width: 18rem;   /* default 17rem */
  --aria-toc-width: 14rem;       /* default 15rem */
}
```

## Theming

Colors come from shadcn tokens (`--background`, `--foreground`, `--muted`, `--muted-foreground`, `--border`, `--primary`, `--destructive`). Component-specific variables (override any of them):

- `--aria-accent`: active nav and TOC item. Default `var(--primary)`.
- `--aria-text-xs|sm|code|base|lg|xl|2xl`: the type scale.
- `--aria-code-background`: code block background.
- `--aria-method-get|post|put|patch|delete|head|options|trace`: method colors. Status colors follow them.

Syntax themes: `@ariadocs/components/styles.css` includes the default. For another one, import `styles/theme.css` plus `styles/syntax/{github,nord,minimal}.css`. Dark values apply under `.dark`.

Every component takes `className` and is merged with `cn()` (tailwind-merge), so a single conflicting utility overrides the default.

## API reference

See [references/openapi.md](references/openapi.md) for the full part list. The essentials:

```tsx
// Everything on one page
<OpenAPI.Root api={api}>
  <OpenAPI.Docs />
</OpenAPI.Root>

// One endpoint per page, composed
<OpenAPI.Root api={api} operationBaseHref="/reference">
  <OpenAPI.Operation id={id} headingLevel={1}>
    <OpenAPI.Operation.Title level={1} />
    <OpenAPI.Operation.Header />
    <OpenAPI.Operation.Parameters />
    <OpenAPI.Operation.RequestBody />
    <OpenAPI.Operation.Responses />
  </OpenAPI.Operation>
</OpenAPI.Root>
```

Inside `Docs.Layout`, an endpoint page returns `<Docs.Content>` only (no `Docs.Aside`).

## Rules

- **Check this list before building anything by hand.** If it's in the "Included" column, use it. If it's in "Not included", copy it from the references.
- `Docs.Nav`, `Docs.Toc`, `Docs.MobileNav` and all `OpenAPI.*` parts are Client Components that take plain data, so a Server Component can render them. Only function props (`linkAs`, `onNavigate`, `onOpenChange`) force a `"use client"` wrapper.
- `Docs.Page.Content` needs `@tailwindcss/typography`. Custom MDX components should use `not-prose` so prose styles don't leak into them.
- Tailwind must scan the package: `@source "../node_modules/@ariadocs/components/dist";` (relative to the CSS file).
- Register MDX components through `createDocs({ components })`, or the `components` prop of `MdxServer` / `MdxClient`. MDX files can't `import`.
- `Pre` replaces `pre` for copy buttons (`components: { pre: Pre }`). It needs `rehypeCodeRaw` after `rehypePrism`.
- Migrating from pre-release names (`Docs.Root`, `useOpenAPIContext`): see [references/migration.md](references/migration.md).
- `Markdown` renders only the small Markdown subset in API descriptions. It is not an MDX renderer.
