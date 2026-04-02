import { docs } from "@/ariadocs";
import NavList from "./sidebar";
import TableOfContents from "./toc";
import { LangProps } from "@/lib/i18n";

type DocsPageProps = { params: Promise<{ slug: string[] }> } & LangProps;

export default async function DocsPage(props: DocsPageProps) {
  let params = await props.params;
  const locale = params.locale;
  params.slug.unshift(locale);
  const slug = params.slug.join("/");
  const [{ MDX, toc }, navItems] = await Promise.all([
    docs.parse({ slug }),
    docs.getNavItems(),
  ]);

  let filteredLocaledNavItems = navItems.filter(
    (item) => item.href == `/${locale}`,
  )[0].items;

  return (
    <div className="grid grid-cols-6">
      <NavList items={filteredLocaledNavItems} />
      <article className="col-span-4">{MDX}</article>
      <TableOfContents toc={toc} />
    </div>
  );
}

export async function generateStaticParams() {
  const paths = await docs.getPagePaths();
  const arr: { slug: string[]; locale: string }[] = [];
  paths.forEach((it) => {
    const path = it.split("/").filter(Boolean);
    let slug = path.slice(1);
    let locale = path[0];
    arr.push({ slug, locale });
  });
  return arr;
}

export async function generateMetadata(props: DocsPageProps) {
  let params = await props.params;
  const locale = params.locale;
  params.slug.unshift(locale);
  const slug = params.slug.join("/");
  const fmt = await docs.getFrontmatter({ slug });
  return {
    title: fmt["title"],
  };
}
