import { docs } from "@/ariadocs";
import { MdxClient } from "@ariadocs/react";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import NavList from "@/components/sidebar";
import TableOfContents from "@/components/toc";
import Head from "next/head";

export default function DocsPage(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  if (!props.data) return null;
  const { serialized, toc, frontmatter } = props.data;
  const navItems = props.nav;
  return (
    <div className="grid grid-cols-6">
      <Head>
        <title>{frontmatter["title"]}</title>
      </Head>
      <NavList items={navItems} />
      <article className="col-span-4">
        <MdxClient serialized={serialized} />
      </article>
      <TableOfContents toc={toc} />
    </div>
  );
}

export const getStaticPaths = async () => {
  const paths = await docs.getPagePaths();
  const urls = paths.map((it) => ({
    params: { slug: it.split("/").filter(Boolean) },
  }));
  console.log(JSON.stringify(urls), null, 4);
  return {
    paths: urls,
    fallback: true,
  };
};

// TODO: handle not found
export const getStaticProps = (async (context) => {
  const slug = (context.params as { slug: string[] }).slug.join("/");
  const data = await docs.serialize({ slug });
  const nav = await docs.getNavItems();
  return { props: { data, nav } };
}) satisfies GetStaticProps;
