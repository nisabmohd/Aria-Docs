<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/nisabmohd/Aria-Docs/master/assets/logo-mark-dark.svg">
    <img alt="Ariadocs" src="https://raw.githubusercontent.com/nisabmohd/Aria-Docs/master/assets/logo-mark-light.svg" width="48">
  </picture>
</p>

# @ariadocs/core

Types and helpers shared by the [Ariadocs](https://github.com/nisabmohd/Aria-Docs) packages. You don't usually install it yourself.

```bash
pnpm add @ariadocs/core
```

It defines `NavItem`, the sidebar format returned by both `@ariadocs/mdx` and `@ariadocs/openapi`, and `TocItem`, a heading in the table of contents.

It also has a few helpers:

| Export | What it does |
| --- | --- |
| `sanitizeUrl(url)` | Returns the URL if it's safe for a link, otherwise `undefined` |
| `isExternalUrl(href)` | `true` for links to another site |
| `slugify(text)` | `"Pets & Owners"` becomes `"pets-owners"` |
| `slugToTitle(slug)` | `"getting-started"` becomes `"Getting Started"` |
| `AriadocsError` | The error class the other packages extend |

## License

MIT © [Nisab Mohd](https://github.com/nisabmohd)
