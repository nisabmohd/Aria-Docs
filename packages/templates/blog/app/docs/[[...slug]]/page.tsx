import { docs } from "@/ariadocs";
import NavList from "./sidebar";
import TableOfContents from "./toc";

type DocsPageProps = { params: Promise<{ slug: string[] }> };

export default async function DocsPage(props: DocsPageProps) {
  const slug = (await props.params).slug.join("/");
  const [{ MDX, toc }, navItems] = await Promise.all([
    docs.parse({ slug }),
    docs.getNavItems(),
  ]);

  return (
    <div className="grid grid-cols-6">
      <NavList items={navItems} />
      <article className="col-span-4">{MDX}</article>
      <TableOfContents toc={toc} />
    </div>
  );
}

export async function generateStaticParams() {
  const paths = await docs.getPagePaths();
  return paths.map((it) => ({ slug: it.split("/").filter(Boolean) }));
}

export async function generateMetadata(props: DocsPageProps) {
  const slug = (await props.params).slug.join("/");
  const fmt = await docs.getFrontmatter({ slug });
  return {
    title: fmt["title"],
  };
}
