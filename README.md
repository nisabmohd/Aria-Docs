# Aria-Docs

A **documentation-building library** for React and Next.js. Render MDX content, organize docs with `_meta.json`, and build modern documentation sites with minimal setup.

**🌐 Website: [ariadocs.vercel.app](https://ariadocs.vercel.app/)**

## Packages

| Package                               | Description                          |
| ------------------------------------- | ------------------------------------ |
| [@ariadocs/react](./packages/library) | Core library for building docs sites |

## Quick Links

- **[Documentation & API Reference](./packages/library/README.md)** - Full usage guide, API reference, and examples
- **[Installation](./packages/library/README.md#installation)** - Get started with `@ariadocs/react`

## Features

- 📝 **MDX Support** - Write documentation in MDX with full React component support
- 🗂️ **Navigation** - Auto-generate navigation from `_meta.json` files
- 🎨 **Syntax Highlighting** - Built-in Prism.js integration for code blocks
- ⚡ **Server Components** - Full support for React Server Components
- 🔌 **Plugin System** - Extensible with remark/rehype plugins

## Quick Start

```bash
pnpm add @ariadocs/react
```

```tsx
import { createDocs } from "@ariadocs/react";
import {
  remarkGfm,
  rehypePrism,
  rehypeSlug,
  rehypeAutolinkHeadings,
  rehypeCodeTitles,
} from "@ariadocs/react/plugins";

export const docs = createDocs({
  contentDir: "contents/docs",
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    rehypeAutolinkHeadings,
    rehypeCodeTitles,
    rehypePrism,
  ],
});
```

👉 **[See full documentation](./packages/library/README.md)** for complete API reference, examples, and guides.

## Development

```bash
# Install dependencies
pnpm install

# Build the library
pnpm --filter @ariadocs/react build

# Run the docs site
pnpm --filter web dev
```

## License

MIT © [Nisab Mohd](https://github.com/nisabmohd)
