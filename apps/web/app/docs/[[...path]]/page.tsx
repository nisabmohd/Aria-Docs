import { docs } from "@/ariadocs";
import type { TocItem } from "@ariadocs/react/types";
import Link from "next/link";
import { notFound } from "next/navigation";

function TableOfContents({ toc }: { toc: TocItem[] }) {
  if (!toc.length) return null;
  return (
    <aside className="not-prose fixed right-20 top-20 hidden w-48 xl:block">
      <nav className="text-sm">
        <p className="mb-2 font-semibold">On this page</p>
        <ul className="space-y-1">
          {toc.map((item) => (
            <li key={item.href} style={{ paddingLeft: (item.depth - 1) * 12 }}>
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {item.value}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default async function Docs({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const slug = (await params).path?.join("/") ?? "index";
  try {
    const { MDX, frontmatter, toc } = await docs.parse({
      slug,
    });
    return (
      <>
        <section className="prose max-w-8xl dark:prose-invert prose-p:leading-5 text-[15px] prose-p:text-muted-foreground prose-code:font-mono prose-headings:mb-3 prose-headings:prose-lg prose-headings:mt-6 prose-p:my-2 prose-li:my-1 prose-ul:my-2 prose-ol:my-2 prose-pre:my-3 py-6">
          <h2>{frontmatter.title}</h2>
          <title>{frontmatter.title}</title>
          {MDX}
        </section>
        <TableOfContents toc={toc} />
      </>
    );
  } catch {
    return notFound();
  }
}

export async function generateStaticParams() {
  const rawPaths = await docs.getPagePaths();
  return rawPaths.map((str) => ({ path: str.split("/").slice(1) }));
}
