# @ariadocs/react

A **documentation-building library** for React and Next.js. Render MDX content, organize docs with `_meta.json`, and build modern documentation sites with minimal setup.

## Installation

```bash
npm install @ariadocs/react
# or
pnpm add @ariadocs/react
# or
yarn add @ariadocs/react
```

## Quick Start

### 1. Import the CSS

```tsx
// In your app's layout or global styles
import "@ariadocs/react/syntax.css";
```

### 2. Create a Docs Instance (Recommended)

Use `createDocs()` to avoid repeating configuration:

```tsx
import { createDocs, recommendedRehypePlugins } from "@ariadocs/react";

// Create once, use everywhere
export const docs = createDocs({
  contentDir: "contents/docs",
  rehypePlugins: recommendedRehypePlugins,
});
```

### 3. Parse and Render MDX

```tsx
import { docs } from "./docs";

export default async function DocPage({
  params,
}: {
  params: { path?: string[] };
}) {
  const slug = params.path?.join("/") ?? "index";

  // Just pass the slug - config is already set!
  const { MDX, frontmatter, toc } = await docs.parse({ slug });

  return (
    <article>
      <h1>{frontmatter.title}</h1>
      <nav>
        {toc.map((item) => (
          <a key={item.id} href={`#${item.id}`}>
            {item.value}
          </a>
        ))}
      </nav>
      {MDX}
    </article>
  );
}
```

### 4. Build Navigation Sidebar

```tsx
import { docs, type NavItem } from "@ariadocs/react";

export default async function Sidebar() {
  // No need to pass contentDir - it's already configured!
  const navItems = await docs.getNavItems();
  return <NavList items={navItems} />;
}

function NavList({ items }: { items: NavItem[] }) {
  return (
    <ul>
      {items
        .filter((item) => item.nav)
        .map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.title}</a>
            {item.items.length > 0 && <NavList items={item.items} />}
          </li>
        ))}
    </ul>
  );
}
```

## API Reference

### `createDocs(config)` (Recommended)

Create a docs instance with pre-configured options. Eliminates repetitive configuration.

```tsx
import { createDocs, recommendedRehypePlugins } from "@ariadocs/react";

const docs = createDocs({
  contentDir: "contents/docs",
  remarkPlugins: [], // Optional
  rehypePlugins: recommendedRehypePlugins, // Optional
  mdxComponents: {}, // Optional
});

// All methods share the config
await docs.parse({ slug: "intro" }); // Parse for server
await docs.serialize({ slug: "intro" }); // Serialize for client
await docs.getFrontmatter({ slug: "intro" }); // Get frontmatter only
await docs.getToc({ slug: "intro" }); // Get TOC only
await docs.readMdx({ slug: "intro" }); // Read raw content
await docs.getNavItems(); // Get navigation tree
await docs.getPagePaths(); // Get all page paths
```

#### Override Options Per-Call

```tsx
const docs = createDocs({
  contentDir: "contents/docs",
  rehypePlugins: defaultPlugins,
});

// Override plugins for a specific call
await docs.parse({
  slug: "special",
  rehypePlugins: customPlugins, // Uses customPlugins instead
});
```

---

### Standalone Functions

Use these when you need one-off operations without creating an instance.

#### `parseMdx(options)`

Parse a local MDX file for server-side rendering.

```tsx
const { raw, content, frontmatter, toc, MDX } = await parseMdx({
  contentDir: "contents/docs", // Required: path to content directory
  slug: "getting-started", // Required: file path without .mdx
  remarkPlugins: [], // Optional: remark plugins
  rehypePlugins: recommendedRehypePlugins, // Optional: rehype plugins
  mdxComponents: {}, // Optional: custom MDX components
});
```

#### `serializeMdx(options)`

Serialize MDX for client-side rendering with `MdxClient`.

```tsx
// Server component
const { serialized, frontmatter, toc } = await serializeMdx({
  contentDir: "contents/docs",
  slug: "getting-started",
  rehypePlugins: recommendedRehypePlugins,
});

// Pass to client component
<DocClient serialized={serialized} />;
```

#### `getFrontmatter(options)`

Get only the frontmatter from an MDX file.

```tsx
const frontmatter = await getFrontmatter({
  contentDir: "contents/docs",
  slug: "getting-started",
});
```

#### `getToc(options)`

Get only the table of contents.

```tsx
const toc = await getToc({
  contentDir: "contents/docs",
  slug: "getting-started",
});
```

### Remote MDX Functions

For MDX content from APIs, CMS, or GitHub:

```tsx
import { parseMdxRemote, serializeMdxRemote } from "@ariadocs/react";

// Parse remote MDX
const { MDX, frontmatter, toc } = await parseMdxRemote({
  raw: mdxContentString,
  rehypePlugins: recommendedRehypePlugins,
});

// Serialize for client
const { serialized } = await serializeMdxRemote({
  raw: mdxContentString,
  rehypePlugins: recommendedRehypePlugins,
});
```

### Navigation Functions

#### `getNavItems(options)`

Build navigation tree from content directory structure and `_meta.json` files.

```tsx
const navItems = await getNavItems({
  contentDir: "contents/docs",
});
```

#### `getPagePaths(options)`

Get all page paths for static generation.

```tsx
export async function generateStaticParams() {
  const paths = await getPagePaths({ contentDir: "contents/docs" });
  return paths.map((path) => ({ path: path.split("/").filter(Boolean) }));
}
```

### Components

#### `<MdxServer />`

Server component for rendering MDX.

```tsx
import { MdxServer, recommendedRehypePlugins } from "@ariadocs/react";

<MdxServer
  raw={mdxContent}
  options={{
    rehypePlugins: recommendedRehypePlugins,
  }}
  components={
    {
      // Custom components
    }
  }
/>;
```

#### `<MdxClient />`

Client component for rendering serialized MDX.

```tsx
"use client";
import { MdxClient } from "@ariadocs/react";

<MdxClient serialized={serializedResult} mdxComponents={{}} />;
```

### Plugins

```tsx
import {
  recommendedRemarkPlugins,
  recommendedRehypePlugins,
  // Individual plugins
  remarkGfm,
  rehypePrism,
  rehypeAutolinkHeadings,
  rehypeSlug,
  rehypeCodeTitles,
} from "@ariadocs/react";
```

- `recommendedRemarkPlugins`: `[remarkGfm]` - GitHub Flavored Markdown
- `recommendedRehypePlugins`: Code highlighting, slugs, autolink headings

## Organizing Content with `_meta.json`

Control navigation order, titles, and visibility with `_meta.json` files:

```
contents/docs/
├── _meta.json
├── introduction.mdx
├── getting-started.mdx
├── advanced/
│   ├── _meta.json
│   ├── configuration.mdx
│   └── plugins.mdx
└── api/
    └── reference.mdx
```

### `_meta.json` Format

```json
[
  { "slug": "introduction", "title": "Introduction", "nav": true },
  { "slug": "getting-started", "title": "Quick Start", "nav": true },
  { "slug": "advanced", "title": "Advanced", "nav": true },
  { "slug": "api", "title": "API Reference", "nav": true }
]
```

### Options

| Property | Type                     | Default             | Description                          |
| -------- | ------------------------ | ------------------- | ------------------------------------ |
| `slug`   | `string`                 | Required            | File or folder name (without `.mdx`) |
| `title`  | `string`                 | `slugToTitle(slug)` | Display title                        |
| `nav`    | `boolean`                | `true`              | Show in navigation                   |
| `props`  | `Record<string, string>` | `{}`                | Custom props for rendering           |

### Behavior

- Items in `_meta.json` appear **in the order defined**
- Items not in `_meta.json` are **appended at the end** (sorted alphabetically)
- Nested directories use their own `_meta.json`

## Custom Frontmatter

```tsx
interface MyFrontmatter {
  title: string;
  description: string;
  author: string;
  tags: string[];
}

const { frontmatter } = await parseMdx<MyFrontmatter>({
  contentDir: "contents/docs",
  slug: "article",
});

// frontmatter.title, frontmatter.author, etc. are typed!
```

## Full Next.js Example

```tsx
// lib/docs.ts - Create docs instance once
import { createDocs, recommendedRehypePlugins } from "@ariadocs/react";

export const docs = createDocs({
  contentDir: "contents/docs",
  rehypePlugins: recommendedRehypePlugins,
});
```

```tsx
// app/docs/[[...path]]/page.tsx
import { docs } from "@/lib/docs";
import "@ariadocs/react/syntax.css";

export async function generateStaticParams() {
  const paths = await docs.getPagePaths();
  return paths.map((path) => ({ path: path.split("/").filter(Boolean) }));
}

export default async function DocPage({
  params,
}: {
  params: { path?: string[] };
}) {
  const slug = params.path?.join("/") ?? "index";

  const [{ MDX, frontmatter, toc }, navItems] = await Promise.all([
    docs.parse({ slug }),
    docs.getNavItems(),
  ]);

  return (
    <div className="flex">
      <aside>
        <NavList items={navItems} />
      </aside>
      <main>
        <h1>{frontmatter.title}</h1>
        <Toc items={toc} />
        {MDX}
      </main>
    </div>
  );
}
```

## License

MIT © [Nisab Mohd](https://github.com/nisabmohd)
