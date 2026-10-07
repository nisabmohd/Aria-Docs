import type { ReactNode } from "react";
import Link from "next/link";
import { CodeBlock, CopyButton, Docs, OpenAPI } from "@ariadocs/components";
import type { NavItem } from "@ariadocs/core";
import { parseMdx } from "@ariadocs/mdx";
import { GitHubIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { SearchButton } from "@/components/search";
import { ThemeToggle } from "@/components/theme-toggle";
import { withBase } from "@/lib/navigation";
import { site } from "@/lib/site";
import { docs, openapi, REFERENCE_BASE } from "@/lib/source";

const mdxSource = `---
title: Sending your first email
---

Install the SDK, then call \`emails.send\` with
a sender, a recipient and some HTML.

<Callout type="tip">
  Use \`onboarding@resend.dev\` as the sender
  while you test.
</Callout>

## Install

\`\`\`bash
npm install resend
\`\`\`
`;

const mdxCode = `import { createDocs } from "@ariadocs/mdx";

const docs = createDocs({ contentDir: "content/docs" });

const { MDX, frontmatter, toc } = await docs.parse({
  slug: "first-email",
});`;

const specExcerpt = `paths:
  /emails/{email_id}:
    get:
      operationId: emails/get
      tags:
        - Emails
      summary: Retrieve a single email
      parameters:
        - name: email_id
          in: path
          required: true
          schema:
            type: string
          description: The ID of the email.`;

const openapiCode = `<OpenAPI.Root api={await openapi.parse()}>
  <OpenAPI.Operation id="emails-get">
    <OpenAPI.Operation.Title />
    <OpenAPI.Operation.Header />
    <OpenAPI.Operation.Parameters />
  </OpenAPI.Operation>
</OpenAPI.Root>`;

const sidebarCode = `const sidebar = [
  ...(await docs.getNavigation()),
  ...(await openapi.getNavigation()),
];

<Docs.Nav items={sidebar} />`;

const frameworks = [
  { name: "Next.js App Router", href: "/docs/getting-started/nextjs-app" },
  { name: "Next.js Pages Router", href: "/docs/getting-started/nextjs-pages" },
  { name: "React Router", href: "/docs/getting-started/react-router" },
  { name: "TanStack Start", href: "/docs/getting-started/tanstack-start" },
];

export default async function HomePage() {
  const api = await openapi.parse();
  const { MDX, frontmatter } = await parseMdx<{ title: string }>({
    source: mdxSource,
    remarkPlugins: docs.config.remarkPlugins,
    rehypePlugins: docs.config.rehypePlugins,
    components: docs.config.components,
  });

  // A real merged sidebar: the getting-started guides plus the API endpoints.
  const guides = withBase(await docs.getNavigation(), "/docs").find(
    (item) => item.href === "/docs/getting-started",
  );
  const endpoints = await openapi.getNavigation({
    getOperationHref: (operation) => `${REFERENCE_BASE}/${operation.id}`,
  });
  const sidebar: NavItem[] = [
    ...(guides !== undefined
      ? [{ ...guides, items: guides.items.slice(0, 3) }]
      : []),
    ...endpoints,
  ];

  return (
    <>
      <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5 sm:px-6">
          <Link
            href="/"
            aria-label={`${site.name} home`}
            className="flex text-[17px]"
          >
            <Logo />
          </Link>
          <nav className="text-muted-foreground hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/docs"
              className="hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/components"
              className="hover:text-foreground transition-colors"
            >
              Components
            </Link>
            <Link
              href={REFERENCE_BASE}
              className="hover:text-foreground transition-colors"
            >
              API Reference
            </Link>
            <a
              href={site.github}
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <SearchButton className="hidden w-52 sm:flex" />
            <SearchButton compact className="sm:hidden" />
            <ThemeToggle className="hidden sm:flex" />
            <Link
              href="/docs"
              className="bg-foreground text-background inline-flex h-9 items-center rounded-lg px-3.5 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden
            className="absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
          />
          <div className="relative mx-auto max-w-4xl px-5 pt-24 pb-24 text-center sm:pt-32 sm:pb-28">
            <h1 className="text-[2.75rem] leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-7xl">
              Docs and API references for React
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-balance sm:text-xl">
              Write your guides in MDX and bring your OpenAPI spec. Ariadocs
              turns both into pages, with one set of React components.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/docs"
                className="bg-foreground text-nowrap text-background inline-flex h-11 w-full items-center justify-center rounded-lg px-6 text-[15px] font-medium transition-opacity hover:opacity-90 sm:w-auto"
              >
                Get Started
              </Link>
              <Link
                href="/components"
                className="bg-background text-nowrap hover:bg-muted inline-flex h-11 w-full items-center justify-center rounded-lg border px-6 text-[15px] font-medium transition-colors sm:w-auto"
              >
                Browse Components
              </Link>
              <div className="bg-background text-nowrap text-muted-foreground flex h-11 w-full items-center gap-2 rounded-lg border pr-1 pl-4 font-mono text-[13px] sm:w-auto">
                <span className="select-none" aria-hidden>
                  ~
                </span>
                <span className="text-foreground min-w-0 flex-1 truncate text-left">
                  {site.install}
                </span>
                <CopyButton value={site.install} />
              </div>
            </div>
          </div>
        </section>

        <Showcase
          label="@ariadocs/mdx"
          title="Write docs in MDX"
          text="Put .mdx files in a folder. Each one becomes a page with its frontmatter, its table of contents and your own components."
          href="/docs/mdx"
          source={
            <>
              <CodeBlock
                code={mdxSource}
                title="content/docs/first-email.mdx"
                className="rounded-none border-0"
              />
              <CodeBlock
                code={mdxCode}
                language="javascript"
                title="lib/docs.ts"
                className="rounded-none border-0 border-t"
              />
            </>
          }
          result={
            <Docs.Page className="p-6 sm:p-8">
              <Docs.Page.Title className="text-2xl">
                {frontmatter.title}
              </Docs.Page.Title>
              <Docs.Page.Content className="mt-4">{MDX}</Docs.Page.Content>
            </Docs.Page>
          }
        />

        <Showcase
          label="@ariadocs/openapi"
          title="Render your API from OpenAPI"
          text="Point it at a JSON or YAML spec. Every endpoint becomes typed data, and the components turn it into a page. This is Resend's real spec."
          href="/docs/openapi"
          source={
            <>
              <CodeBlock
                code={specExcerpt}
                title="openapi.yaml"
                className="rounded-none border-0"
              />
              <CodeBlock
                code={openapiCode}
                language="javascript"
                title="app/reference/page.tsx"
                className="rounded-none border-0 border-t"
              />
            </>
          }
          result={
            <div className="p-6 sm:p-8">
              <OpenAPI.Root api={api} operationBaseHref={REFERENCE_BASE}>
                <OpenAPI.Operation id="emails-get">
                  <OpenAPI.Operation.Title level={3} />
                  <OpenAPI.Operation.Header className="mt-4" />
                  <OpenAPI.Operation.Parameters className="mt-8" />
                </OpenAPI.Operation>
              </OpenAPI.Root>
            </div>
          }
        />

        <Showcase
          label="@ariadocs/components"
          title="One sidebar for both"
          text="Both packages return navigation in the same format. Merge them and one component renders your guides and your endpoints."
          href="/components/docs/nav"
          source={
            <CodeBlock
              code={sidebarCode}
              language="javascript"
              title="app/layout.tsx"
              className="rounded-none border-0"
            />
          }
          result={
            <div className="p-6 sm:p-8">
              <div className="max-w-72">
                <Docs.Nav
                  items={sidebar}
                  activeHref="/docs/getting-started/installation"
                />
              </div>
            </div>
          }
        />

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Works with your framework
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {frameworks.map((framework) => (
              <Link
                key={framework.name}
                href={framework.href}
                className="hover:bg-muted/50 flex items-center justify-between rounded-xl border px-4 py-3.5 text-sm font-medium transition-colors"
              >
                {framework.name}
                <span className="text-muted-foreground" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 text-sm sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="text-muted-foreground mt-2">
              MIT License © Nisab Mohd
            </p>
          </div>
          <FooterColumn
            title="Docs"
            links={[
              { label: "Introduction", href: "/docs" },
              {
                label: "Installation",
                href: "/docs/getting-started/installation",
              },
              {
                label: "Next.js App Router",
                href: "/docs/getting-started/nextjs-app",
              },
              {
                label: "Migrating from @ariadocs/react",
                href: "/docs/guides/migration",
              },
            ]}
          />
          <FooterColumn
            title="Packages"
            links={[
              { label: "@ariadocs/mdx", href: "/docs/mdx" },
              { label: "@ariadocs/openapi", href: "/docs/openapi" },
              { label: "@ariadocs/components", href: "/components" },
              { label: "@ariadocs/core", href: "/docs/core" },
            ]}
          />
          <FooterColumn
            title="Resources"
            links={[
              { label: "API Reference example", href: REFERENCE_BASE },
              { label: "GitHub", href: site.github },
              { label: "Issues", href: `${site.github}/issues` },
              {
                label: "Sponsor",
                href: "https://github.com/sponsors/nisabmohd",
              },
            ]}
          />
        </div>
        <div className="mx-auto flex max-w-6xl items-center justify-between border-t px-5 py-6 sm:px-6">
          <a
            href={site.github}
            aria-label="GitHub repository"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <GitHubIcon />
          </a>
          <ThemeToggle />
        </div>
      </footer>
    </>
  );
}

/** A feature shown as real input next to the real output it produces. */
function Showcase({
  label,
  title,
  text,
  href,
  source,
  result,
}: {
  label: string;
  title: string;
  text: string;
  href: string;
  source: ReactNode;
  result: ReactNode;
}) {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div className="max-w-xl">
            <p className="text-muted-foreground font-mono text-sm">{label}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h2>
            <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
              {text}
            </p>
          </div>
          <Link
            href={href}
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Read the docs →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-2xl border lg:grid-cols-2">
          <div className="bg-[var(--aria-code-background)] min-w-0 border-b lg:border-r lg:border-b-0">
            {source}
          </div>
          <div className="bg-background min-w-0">
            <p className="text-muted-foreground border-b px-6 py-2.5 text-xs sm:px-8">
              Result
            </p>
            {result}
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
