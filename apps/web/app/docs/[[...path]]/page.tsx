import { docs } from "@/ariadocs";

export default async function Docs({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const slug = (await params).path?.join("/") ?? "index";
  const { MDX, frontmatter } = await docs.parse({ slug });

  return (
    <section className="prose dark:prose-invert mx-auto max-w-full">
      <h2>{frontmatter.title}</h2>
      <title>{frontmatter.title}</title>
      {MDX}
    </section>
  );
}

export async function generateStaticParams() {
  const rawPaths = await docs.getPagePaths();
  // remove initial slash, hence sliced
  return rawPaths.map((str) => ({ path: str.split("/").slice(1) }));
}