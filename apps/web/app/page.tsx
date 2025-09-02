import { docs } from "@/ariadocs";

export default async function Page() {
  let { frontmatter, MDX, toc } = await docs.parse({
    slug: "installation",
  });

  const paths = await docs.pagePaths();
  let navPaths = await docs.navItems();

  return (
    <section className="flex flex-col gap-5">
      <title>{frontmatter.title}</title>
      <pre>toc : {JSON.stringify(toc, null, 4)}</pre>
      <pre>allHrefs : {JSON.stringify(paths, null, 4)}</pre>
      <pre>navItems : {JSON.stringify(navPaths, null, 4)}</pre>
      <div className="prose">{MDX}</div>
    </section>
  );
}
