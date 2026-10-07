<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/logo-mark-dark.svg">
    <img alt="Ariadocs" src="./assets/logo-mark-light.svg" width="56">
  </picture>
</p>

# Ariadocs

Build documentation sites and API references in React.

Write your guides in MDX, bring your OpenAPI spec, and render both with the same components. Pages work as React Server Components, and on the client when you need it.

[Website](https://ariadocs.vercel.app) · [Docs](https://ariadocs.vercel.app/docs) · [Components](https://ariadocs.vercel.app/components) · [Example API reference](https://ariadocs.vercel.app/reference)

## Packages

| Package | What it does |
| --- | --- |
| [`@ariadocs/mdx`](./packages/lib-mdx) | Reads MDX files into pages, a table of contents and a sidebar. Replaces `@ariadocs/react`. |
| [`@ariadocs/openapi`](./packages/lib-openapi) | Reads an OpenAPI 3.x spec into typed data for every endpoint. |
| [`@ariadocs/components`](./packages/lib-components) | React components for docs pages and API references. |
| [`@ariadocs/core`](./packages/lib-core) | Types and helpers the other packages share. |

## Quick start

Add the packages to your app:

```bash
pnpm add @ariadocs/mdx @ariadocs/openapi @ariadocs/components
```

```tsx
import { createDocs } from "@ariadocs/mdx";
import { createOpenAPI } from "@ariadocs/openapi";
import { OpenAPI } from "@ariadocs/components";

const docs = createDocs({ contentDir: "content/docs" });
const openapi = createOpenAPI({ source: "./openapi.yaml" });

// A docs page
const { MDX, frontmatter } = await docs.parse({ slug: "intro" });

// An API endpoint
const api = await openapi.parse();
<OpenAPI.Root api={api}>
  <OpenAPI.Operation id="emails-send" />
</OpenAPI.Root>;
```

Both `docs.getNavigation()` and `openapi.getNavigation()` return the same format, so one sidebar can list your guides and your endpoints.

The [framework guides](https://ariadocs.vercel.app/docs/getting-started/nextjs-app) cover the Next.js App Router, the Pages Router, React Router and TanStack Start.


## AI agents

The [`skills/ariadocs`](./skills/ariadocs) folder is an agent skill that teaches AI coding agents to set up Ariadocs in any supported framework. Install it with:

```bash
npx skills add nisabmohd/Aria-Docs
```

Or copy the folder into `.claude/skills/` (Claude Code) or your agent's skills directory.

## Working on this repo

```bash
pnpm install
pnpm build          # packages and the docs site
pnpm test
pnpm --filter web dev
```

The docs site lives in `apps/web`. Its API Reference renders three endpoints from [Resend's public OpenAPI spec](https://github.com/resend/resend-openapi) (MIT).

To release the packages, follow [PUBLISH.md](./PUBLISH.md).

## License

MIT © [Nisab Mohd](https://github.com/nisabmohd)
