<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/nisabmohd/Aria-Docs/master/assets/logo-mark-dark.svg">
    <img alt="Ariadocs" src="https://raw.githubusercontent.com/nisabmohd/Aria-Docs/master/assets/logo-mark-light.svg" width="48">
  </picture>
</p>

# @ariadocs/mdx

Turn a folder of MDX files into pages, a table of contents and a sidebar. Part of [Ariadocs](https://github.com/nisabmohd/Aria-Docs). This package replaces `@ariadocs/react`.

```bash
pnpm add @ariadocs/mdx
```

## Usage

```ts
import { createDocs } from "@ariadocs/mdx";
import { remarkGfm, rehypeSlug, rehypePrism } from "@ariadocs/mdx/plugins";

export const docs = createDocs({
  contentDir: "content/docs",
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeSlug, rehypePrism],
});

const { MDX, frontmatter, toc } = await docs.parse({ slug: "intro" }); // for Server Components
const { serialized } = await docs.serialize({ slug: "intro" }); // for MdxClient
const sidebar = await docs.getNavigation();
const paths = await docs.getPagePaths();
```

MDX can also come from a string, for example from a CMS:

```ts
import { parseMdx } from "@ariadocs/mdx";

const { MDX } = await parseMdx({ source: textFromCms, blockJs: true });
```

In Client Components, import `MdxClient` from `@ariadocs/mdx/client`. The main entry reads files and won't bundle for the browser.

## Safety

- Slugs can't point outside the content folder, so `../../etc/passwd` is rejected.
- JavaScript frontmatter (`---js`) is refused.
- MDX `import` and `export` are switched off. `blockJs: true` also removes `{expressions}`, for MDX you don't trust.

## Docs

[ariadocs.vercel.app/docs/mdx](https://ariadocs.vercel.app/docs/mdx). Upgrading from `@ariadocs/react`? See the [migration guide](https://ariadocs.vercel.app/docs/guides/migration).

## License

MIT © [Nisab Mohd](https://github.com/nisabmohd)
