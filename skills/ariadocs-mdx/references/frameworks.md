# Framework recipes: MDX docs

Each recipe assumes the shared `docs` instance from SKILL.md (`lib/docs.ts`). Change the import paths to match the project's alias. API reference routes are in the `ariadocs-openapi` skill.

## Next.js App Router

Server Components render `docs.parse()` output directly. The sidebar lives in `layout.tsx` and the TOC in `page.tsx`. The page returns `Docs.Content` and `Docs.Aside` **as a fragment**, so they stay direct children of the `Docs.Layout` grid. Don't build a custom grid.

```tsx title="app/docs/[[...slug]]/page.tsx"
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isMdxNotFound } from "@ariadocs/mdx";
import { Docs } from "@ariadocs/components";
import { docs } from "@/lib/docs";

type Frontmatter = { title: string; description?: string };
type Props = { params: Promise<{ slug?: string[] }> };

export default async function Page({ params }: Props) {
  const slug = (await params).slug?.join("/") ?? "";
  try {
    const { MDX, frontmatter, toc } = await docs.parse<Frontmatter>({ slug });
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
    );
  } catch (error) {
    if (isMdxNotFound(error)) notFound();
    throw error;
  }
}

export async function generateStaticParams() {
  const paths = await docs.getPagePaths();
  return paths.map((path) => ({ slug: path.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug?.join("/") ?? "";
  try {
    const { title, description } = await docs.getFrontmatter<Frontmatter>({ slug });
    return { title, description };
  } catch {
    return {};
  }
}
```

```tsx title="app/docs/layout.tsx"
import { Docs } from "@ariadocs/components";
import { docs } from "@/lib/docs";
import { Sidebar } from "@/components/sidebar";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const items = await docs.getNavigation();
  return (
    <>
      <header className="bg-background sticky top-0 z-40 flex h-14 items-center gap-2 border-b px-4">
        {/* Below lg, Docs.Sidebar is hidden: the drawer holds the same nav */}
        <Docs.MobileNav>
          <Sidebar items={items} baseHref="/docs" />
        </Docs.MobileNav>
      </header>
      <Docs.Layout>
        <Docs.Sidebar>
          <Sidebar items={items} baseHref="/docs" />
        </Docs.Sidebar>
        {children}
      </Docs.Layout>
    </>
  );
}
```

```tsx title="components/sidebar.tsx"
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Docs } from "@ariadocs/components";
import type { NavItem } from "@ariadocs/core";

export function Sidebar({ items, baseHref }: { items: NavItem[]; baseHref?: string }) {
  return <Docs.Nav items={items} baseHref={baseHref} activeHref={usePathname()} linkAs={Link} />;
}
```

`NavItem` is also exported from `@ariadocs/mdx` if `@ariadocs/core` is not a direct dependency.

## Next.js Pages Router

There are no Server Components, so serialize in `getStaticProps` and render with `MdxClient`.

```tsx title="pages/docs/[[...slug]].tsx"
import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { isMdxNotFound, type NavItem, type SerializeResult, type TocItem } from "@ariadocs/mdx";
import { MdxClient } from "@ariadocs/mdx/client";
import { Docs } from "@ariadocs/components";
import { docs } from "@/lib/docs";

type Props = { serialized: SerializeResult; title: string; toc: TocItem[]; nav: NavItem[] };

export default function Page({ serialized, title, toc, nav }: Props) {
  const { asPath } = useRouter();
  return (
    <Docs.Layout>
      <Docs.Sidebar>
        <Docs.Nav items={nav} baseHref="/docs" activeHref={asPath.split(/[?#]/)[0]} linkAs={Link} />
      </Docs.Sidebar>
      <Docs.Content>
        <Docs.Page>
          <Docs.Page.Title>{title}</Docs.Page.Title>
          <Docs.Page.Content>
            <MdxClient serialized={serialized} />
          </Docs.Page.Content>
        </Docs.Page>
      </Docs.Content>
      <Docs.Aside>
        <Docs.Toc items={toc} />
      </Docs.Aside>
    </Docs.Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = ((params?.slug as string[] | undefined) ?? []).join("/");
  try {
    const [{ serialized, frontmatter, toc }, nav] = await Promise.all([
      docs.serialize<{ title: string }>({ slug }),
      docs.getNavigation(),
    ]);
    return { props: { serialized, title: frontmatter.title, toc, nav } };
  } catch (error) {
    if (isMdxNotFound(error)) return { notFound: true };
    throw error;
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await docs.getPagePaths();
  return {
    paths: paths.map((path) => ({ params: { slug: path.split("/").filter(Boolean) } })),
    fallback: false,
  };
};
```

Only type imports come from the main `@ariadocs/mdx` entry in the component. Next removes the `getStaticProps` code from the client bundle.

The global CSS import (`@ariadocs/components/styles.css`) goes in `pages/_app.tsx`.

## React Router v7 and v8 (framework mode)

```ts title="app/routes.ts"
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("docs/*", "routes/docs.tsx")] satisfies RouteConfig;
```

```tsx title="app/routes/docs.tsx"
import { useLoaderData, useLocation, Link } from "react-router";
import { isMdxNotFound } from "@ariadocs/mdx";
import { MdxClient } from "@ariadocs/mdx/client";
import { Docs, type LinkComponentProps } from "@ariadocs/components";
import type { Route } from "./+types/docs";
import { docs } from "../docs";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const [{ serialized, frontmatter, toc }, nav] = await Promise.all([
      docs.serialize<{ title: string }>({ slug: params["*"] ?? "" }),
      docs.getNavigation(),
    ]);
    // Return only what the page renders: `source` and `content` would send the raw MDX too.
    return { serialized, frontmatter, toc, nav };
  } catch (error) {
    if (isMdxNotFound(error)) throw new Response("Not found", { status: 404 });
    throw error;
  }
}

export default function DocsPage() {
  const { serialized, frontmatter, toc, nav } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  return (
    <Docs.Layout>
      <Docs.Sidebar>
        <Docs.Nav items={nav} baseHref="/docs" activeHref={pathname} linkAs={DocLink} />
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
  );
}

function DocLink({ href, ...props }: LinkComponentProps) {
  return <Link to={href} {...props} />;
}
```

```ts title="react-router.config.ts"
import type { Config } from "@react-router/dev/config";
import { docs } from "./app/docs";

export default {
  ssr: true,
  async prerender() {
    const paths = await docs.getPagePaths();
    return paths.map((path) => `/docs${path === "/" ? "" : path}`);
  },
} satisfies Config;
```

The CSS import goes in `app/root.tsx` (or `app/app.css` via `@import`).

## TanStack Start

Loaders also run in the browser during client navigation, so anything that reads files goes through `createServerFn`.

```tsx title="src/routes/docs/$.tsx"
import { Link, createFileRoute, notFound, useLocation } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { isMdxNotFound } from "@ariadocs/mdx";
import { MdxClient } from "@ariadocs/mdx/client";
import { Docs, type LinkComponentProps } from "@ariadocs/components";
import { docs } from "../../docs";

const getPage = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    try {
      const [{ serialized, frontmatter, toc }, nav] = await Promise.all([
        docs.serialize<{ title: string }>({ slug }),
        docs.getNavigation(),
      ]);
      // Return only what the page renders: `source` and `content` would send the raw MDX too.
      return { serialized, frontmatter, toc, nav };
    } catch (error) {
      if (isMdxNotFound(error)) throw notFound();
      throw error;
    }
  });

export const Route = createFileRoute("/docs/$")({
  loader: ({ params }) => getPage({ data: params._splat ?? "" }),
  component: DocsPage,
});

function DocsPage() {
  const { serialized, frontmatter, toc, nav } = Route.useLoaderData();
  const { pathname } = useLocation();
  return (
    <Docs.Layout>
      <Docs.Sidebar>
        <Docs.Nav items={nav} baseHref="/docs" activeHref={pathname} linkAs={DocLink} />
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
  );
}

function DocLink({ href, ...props }: LinkComponentProps) {
  // exact: otherwise TanStack also marks parent pages like /docs as current.
  return <Link to={href} activeOptions={{ exact: true }} {...props} />;
}
```

The CSS import goes in `src/routes/__root.tsx`.

## MDX from a string (CMS, database)

```ts
import { parseMdx, serializeMdx } from "@ariadocs/mdx";

const { MDX, frontmatter, toc } = await parseMdx({ source: text, blockJs: true, rehypePlugins: [...] });
const { serialized } = await serializeMdx({ source: text, blockJs: true });
```
