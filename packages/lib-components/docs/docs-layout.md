# Docs layout

Use `Docs.Layout` for the page shell instead of writing your own grid. It covers the usual cases:

- **Columns follow the slots present.** `Docs.Sidebar` adds the left column (from `lg`). `Docs.Aside` adds the right column (from `xl`), but only when it renders something, so pages without a table of contents (API reference pages, for example) get no empty strip.
- **Sizes are CSS variables:** `--aria-docs-max-width` (90rem), `--aria-sidebar-width` (17rem), `--aria-toc-width` (15rem), `--aria-header-height` (0px).
- **Mobile:** `Docs.Sidebar` is hidden below `lg`. Put the same nav in `Docs.MobileNav`, a menu button with a drawer.

The slots (`Docs.Sidebar`, `Docs.Content`, `Docs.Aside`) must be **direct children** of `Docs.Layout`. Don't wrap them in a `div`.

## Next.js App Router

The sidebar belongs in `layout.tsx` (it persists across pages), and the table of contents belongs in `page.tsx` (it changes per page). Return `Docs.Content` and `Docs.Aside` from the page **as a fragment**, so they become direct children of the layout's grid:

```tsx
// app/docs/layout.tsx
import { Docs } from "@ariadocs/components"
import { docs } from "@/lib/docs"
import { Nav } from "./nav"

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const nav = await docs.getNavigation()
  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background px-4">
        <Docs.MobileNav>
          <Nav items={nav} />
        </Docs.MobileNav>
        <a href="/">My docs</a>
      </header>
      <Docs.Layout>
        <Docs.Sidebar>
          <Nav items={nav} />
        </Docs.Sidebar>
        {children}
      </Docs.Layout>
    </>
  )
}
```

```tsx
// app/docs/nav.tsx — linkAs and usePathname need a Client Component
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Docs } from "@ariadocs/components"
import type { NavItem } from "@ariadocs/core"

export function Nav({ items }: { items: NavItem[] }) {
  return <Docs.Nav items={items} baseHref="/docs" activeHref={usePathname()} linkAs={Link} />
}
```

```tsx
// app/docs/[[...slug]]/page.tsx
import { notFound } from "next/navigation"
import { isMdxNotFound } from "@ariadocs/mdx"
import { Docs } from "@ariadocs/components"
import { docs } from "@/lib/docs"

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const slug = ((await params).slug ?? []).join("/")
  try {
    const { MDX, frontmatter, toc } = await docs.parse<{ title: string; description?: string }>({ slug })
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
  } catch (error) {
    if (isMdxNotFound(error)) notFound()
    throw error
  }
}
```

With a sticky header, set its height so the sidebar and TOC sit below it:

```css
:root { --aria-header-height: 3.5rem; }
```

An API reference page under the same layout returns only `Docs.Content`. With no `Docs.Aside`, the content takes the full width:

```tsx
// app/docs/api/[operation]/page.tsx
return (
  <Docs.Content>
    <OpenAPI.Root api={api} operationBaseHref="/docs/api">
      <OpenAPI.Operation id={operation} headingLevel={1} />
    </OpenAPI.Root>
  </Docs.Content>
)
```

## One component tree (Pages Router, React Router, TanStack Start)

When one route component renders the whole page, put everything in one tree:

```tsx
<Docs.Layout>
  <Docs.Sidebar>
    <Docs.Nav items={nav} baseHref="/docs" activeHref={pathname} linkAs={Link} />
  </Docs.Sidebar>
  <Docs.Content>
    <Docs.Page>
      <Docs.Page.Title>{frontmatter.title}</Docs.Page.Title>
      <Docs.Page.Content>
        <MdxClient serialized={serialized} />
      </Docs.Page.Content>
    </Docs.Page>
  </Docs.Content>
  <Docs.Aside>
    <Docs.Toc items={toc} />
  </Docs.Aside>
</Docs.Layout>
```

## Parts

| Part | Props | Notes |
| --- | --- | --- |
| `Docs.Layout` | `children`, `className` | Grid. Override the width with `--aria-docs-max-width` or `className`. |
| `Docs.Sidebar` | `children`, `className` | `<aside>`, sticky, scrolls on its own, `lg` and up. |
| `Docs.MobileNav` | `children`, `title?`, `trigger?`, `open?`, `onOpenChange?`, `triggerClassName?`, `className?` | Client. Button hides from `lg`. Drawer closes when a link inside is clicked. |
| `Docs.Content` | `children`, `className` | `<main>`. |
| `Docs.Aside` | `children`, `className` | `<aside>`, sticky, `xl` and up, hidden when empty. |
| `Docs.Nav` | `items`, `activeHref?`, `baseHref?`, `linkAs?`, `onNavigate?`, `className?` | Client. Top-level folders become headings, deeper ones collapse. |
| `Docs.Toc` | `items`, `title?` ("On this page"), `className?` | Client. Renders nothing for an empty list. |
| `Docs.Page` | `children`, `className` | `<article>`, `max-w-3xl`, centered. |
| `Docs.Page.Title` | `children`, `className` | `<h1>`. |
| `Docs.Page.Description` | `children`, `className` | Muted `<p>`. |
| `Docs.Page.Content` | `children`, `className` | `prose` wrapper. Needs `@tailwindcss/typography`. |

`Docs.Nav` and `Docs.Toc` are Client Components but take only plain data, so a Server Component can render them directly. Only `linkAs` (a function) forces a `"use client"` wrapper.

## MDX components

`Docs.Page.Content` styles plain Markdown. Callouts, tabs, steps and cards are **not included**. Write them yourself and register them with `createDocs({ components: { Callout, Steps, ... } })`. Use `Pre` from this package for code blocks: `components: { pre: Pre }`.
