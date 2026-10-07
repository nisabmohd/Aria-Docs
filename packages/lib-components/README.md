<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/nisabmohd/Aria-Docs/master/assets/logo-mark-dark.svg">
    <img alt="Ariadocs" src="https://raw.githubusercontent.com/nisabmohd/Aria-Docs/master/assets/logo-mark-light.svg" width="48">
  </picture>
</p>

# @ariadocs/components

React components for docs pages and API references. Part of [Ariadocs](https://github.com/nisabmohd/Aria-Docs). They render what `@ariadocs/mdx` and `@ariadocs/openapi` return, from Server or Client Components.

```bash
pnpm add @ariadocs/components
```

## Setup

The components use Tailwind CSS v4. Let Tailwind scan the package, then import the styles once:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@source "../node_modules/@ariadocs/components/dist";
```

```ts
import "@ariadocs/components/styles.css";
```

The components set no fonts and no colors of their own. They use your `font-sans`, `font-mono` and shadcn/ui color tokens.

## API reference

```tsx
import { OpenAPI } from "@ariadocs/components";

<OpenAPI.Root api={api}>
  <OpenAPI.Operation id="emails-send" />
</OpenAPI.Root>;
```

Pass children to choose the parts:

```tsx
<OpenAPI.Operation id="emails-send">
  <OpenAPI.Operation.Title />
  <OpenAPI.Operation.Header />
  <OpenAPI.Operation.Parameters />
</OpenAPI.Operation>
```

## Docs pages

`Docs.Layout` is the page grid. Columns appear only for the slots you render, so a page without `Docs.Aside` gets no empty table-of-contents column.

```tsx
import { Docs } from "@ariadocs/components";

<Docs.Layout>
  <Docs.Sidebar>
    <Docs.Nav items={sidebar} />
  </Docs.Sidebar>
  <Docs.Content>
    <Docs.Page>
      <Docs.Page.Title>{frontmatter.title}</Docs.Page.Title>
      <Docs.Page.Content>{MDX}</Docs.Page.Content>
    </Docs.Page>
  </Docs.Content>
  <Docs.Aside>
    <Docs.Toc items={toc} />
  </Docs.Aside>
</Docs.Layout>
```

### Next.js App Router

Split the tree: the sidebar goes in `layout.tsx` and the table of contents in `page.tsx`. Return `Docs.Content` and `Docs.Aside` from the page as a fragment, so they stay direct children of the layout's grid:

```tsx
// app/docs/layout.tsx
<Docs.Layout>
  <Docs.Sidebar>
    <Nav items={nav} /> {/* "use client" wrapper around Docs.Nav with Link and usePathname */}
  </Docs.Sidebar>
  {children}
</Docs.Layout>

// app/docs/[[...slug]]/page.tsx
return (
  <>
    <Docs.Content>
      <Docs.Page>...</Docs.Page>
    </Docs.Content>
    <Docs.Aside>
      <Docs.Toc items={toc} />
    </Docs.Aside>
  </>
);
```

`Docs.Sidebar` is hidden below `lg`. For phones, put the same nav in `Docs.MobileNav` (a menu button with a drawer) in your header:

```tsx
<Docs.MobileNav>
  <Nav items={nav} />
</Docs.MobileNav>
```

Sizes are CSS variables: `--aria-docs-max-width` (90rem), `--aria-sidebar-width` (17rem), `--aria-toc-width` (15rem) and `--aria-header-height` (0px, for a sticky header).

There are also `CodeBlock`, `Pre` (a code block with a copy button, for MDX), `Markdown` and `MethodBadge`.

## Not included

No MDX content components: there is no `Callout`, `Tabs`, `Steps` or `Cards`. Write your own and pass them through the `components` option of `createDocs`. A site header, search and previous/next links are also up to your app.

## Docs in the package

Full docs ship with the package in `node_modules/@ariadocs/components/docs/`. Start with `index.md`, which lists every export. `docs-layout.md` has the full framework recipes and `openapi.md` covers the API reference.

## Docs

[ariadocs.vercel.app/components](https://ariadocs.vercel.app/components)

## License

MIT © [Nisab Mohd](https://github.com/nisabmohd)
