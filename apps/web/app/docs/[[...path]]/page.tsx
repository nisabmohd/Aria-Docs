import { docs } from "@/ariadocs";

export default async function Docs({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const slug = (await params).path.join("/");
  const { MDX, frontmatter } = await docs.parse({ slug });
  return (
    <section className="prose dark:prose-invert mx-auto py-10 prose-code:font-mono max-w-full px-4">
      <h2>{frontmatter.title}</h2>
      <title>{frontmatter.title}</title>
      {MDX}
    </section>
  );
}

export async function generateStaticParams({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const rawPaths = await docs.pagePaths();
  // remove initial space, hence sliced
  return rawPaths.map((str) => ({ path: str.split("/").slice(1) }));
}
