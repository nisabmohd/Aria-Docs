import { docs } from "@/ariadocs";
import { TableOfContents } from "@/components/toc";
import { notFound } from "next/navigation";

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
      <div className="relative">
        <section className="prose max-w-8xl dark:prose-invert prose-p:leading-5 text-[15px] prose-p:text-muted-foreground prose-code:font-mono prose-headings:mb-3 prose-headings:prose-lg prose-headings:mt-6 prose-p:my-2 prose-li:my-1 prose-ul:my-2 prose-ol:my-2 prose-pre:my-3 md:py-2">
          <h2>{frontmatter.title}</h2>
          <title>{frontmatter.title}</title>
          {MDX}
        </section>
        <TableOfContents toc={toc} />
      </div>
    );
  } catch {
    return notFound();
  }
}

export async function generateStaticParams() {
  const rawPaths = await docs.getPagePaths();
  return rawPaths.map((str) => ({ path: str.split("/").slice(1) }));
}
