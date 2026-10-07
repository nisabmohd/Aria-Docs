# Framework recipes: API reference

Each recipe assumes the shared `openapi` instance from SKILL.md (`lib/openapi.ts`). Change the import paths to match the project's alias. MDX docs routes are in the `ariadocs-mdx` skill.

## Next.js App Router

API reference, one page per endpoint:

```tsx title="app/reference/layout.tsx"
import { OpenAPI } from "@ariadocs/components";
import { openapi } from "@/lib/openapi";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const api = await openapi.parse();
  return (
    <OpenAPI.Root api={api} operationBaseHref="/reference">
      {children}
    </OpenAPI.Root>
  );
}
```

```tsx title="app/reference/[operation]/page.tsx"
import { notFound } from "next/navigation";
import { OpenAPI } from "@ariadocs/components";
import { openapi } from "@/lib/openapi";

export default async function Page({ params }: { params: Promise<{ operation: string }> }) {
  const { operation } = await params;
  if (!(await openapi.getOperation(operation))) notFound();
  return <OpenAPI.Operation id={operation} headingLevel={1} />;
}

export async function generateStaticParams() {
  const paths = await openapi.getPagePaths();
  return paths.map((path) => ({ operation: path.slice(1) }));
}
```

```tsx title="app/reference/page.tsx"
import { OpenAPI } from "@ariadocs/components";

export default function Page() {
  return <OpenAPI.Info />;
}
```

For a small API on a single page, use `<OpenAPI.Root api={api}><OpenAPI.Docs /></OpenAPI.Root>`.

Inside a `Docs.Layout` (shared with MDX docs), the endpoint page returns `<Docs.Content>` only, without `Docs.Aside`, and the layout drops the TOC column. See the `ariadocs-components` skill.

## Next.js Pages Router

```tsx title="pages/reference/[operation].tsx"
import type { GetStaticPaths, GetStaticProps } from "next";
import type { APISpec } from "@ariadocs/openapi";
import { OpenAPI } from "@ariadocs/components";
import { openapi } from "@/lib/openapi";

type Props = { api: APISpec; operation: string };

export default function Page({ api, operation }: Props) {
  return (
    <OpenAPI.Root api={api} operationBaseHref="/reference">
      <OpenAPI.Operation id={operation} headingLevel={1} />
    </OpenAPI.Root>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const api = await openapi.parse();
  // props must be plain JSON: drop undefined fields
  return { props: { api: JSON.parse(JSON.stringify(api)), operation: String(params?.operation) } };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await openapi.getPagePaths();
  return { paths: paths.map((path) => ({ params: { operation: path.slice(1) } })), fallback: false };
};
```

For large specs, pass only the operation (`await openapi.getOperation(id)`) and render `<OpenAPI.Operation operation={operation} />` without `Root`. Authorization details need the full spec, so they are not shown.

The global CSS import (`@ariadocs/components/styles.css`) goes in `pages/_app.tsx`.

## React Router v7 and v8 (framework mode)

```ts title="app/routes.ts"
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("reference/:operation", "routes/reference.tsx")] satisfies RouteConfig;
```

```tsx title="app/routes/reference.tsx"
import { useLoaderData } from "react-router";
import { OpenAPI } from "@ariadocs/components";
import type { Route } from "./+types/reference";
import { openapi } from "../openapi";

export async function loader({ params }: Route.LoaderArgs) {
  return { api: await openapi.parse(), operation: params.operation };
}

export default function ReferencePage() {
  const { api, operation } = useLoaderData<typeof loader>();
  return (
    <OpenAPI.Root api={api} operationBaseHref="/reference">
      <OpenAPI.Operation id={operation} headingLevel={1} />
    </OpenAPI.Root>
  );
}
```

```ts title="react-router.config.ts"
import type { Config } from "@react-router/dev/config";
import { openapi } from "./app/openapi";

export default {
  ssr: true,
  async prerender() {
    const paths = await openapi.getPagePaths();
    return paths.map((path) => `/reference${path}`);
  },
} satisfies Config;
```

The CSS import goes in `app/root.tsx` (or `app/app.css` via `@import`).

## TanStack Start

Loaders also run in the browser during client navigation, so anything that reads files goes through `createServerFn`.

```tsx title="src/routes/reference/$operation.tsx"
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { OpenAPI } from "@ariadocs/components";
import { openapi } from "../../openapi";

const getSpec = createServerFn({ method: "GET" }).handler(() => openapi.parse());

export const Route = createFileRoute("/reference/$operation")({
  loader: () => getSpec(),
  component: ReferencePage,
});

function ReferencePage() {
  const api = Route.useLoaderData();
  const { operation } = Route.useParams();
  return (
    <OpenAPI.Root api={api} operationBaseHref="/reference">
      <OpenAPI.Operation id={operation} headingLevel={1} />
    </OpenAPI.Root>
  );
}
```

`openapi.parse()` caches its result, so the spec is read once per server process. The CSS import goes in `src/routes/__root.tsx`.
