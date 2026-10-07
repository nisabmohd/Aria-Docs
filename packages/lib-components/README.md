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

There are also `CodeBlock`, `Pre` (a code block with a copy button, for MDX), `Markdown` and `MethodBadge`.

## Docs

[ariadocs.vercel.app/components](https://ariadocs.vercel.app/components)

## License

MIT © [Nisab Mohd](https://github.com/nisabmohd)
