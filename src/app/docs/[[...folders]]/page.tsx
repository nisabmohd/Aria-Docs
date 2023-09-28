import { getMarkdown, getToc } from "@/lib/docs";
import React from "react";
import { notFound } from "next/navigation";
import Leftbar from "@/components/leftbar";
import Pagination from "@/components/pagination";
import ScrollTop from "@/components/scroll-top";
import Link from "next/link";
import Toc from "@/components/toc";

async function getMarkDownData(folders: string[]) {
  return await getMarkdown(folders);
}

export async function generateMetadata({
  params: { folders },
}: {
  params: { folders: string[] };
}) {
  const { frontmatter } = await getMarkDownData(folders);
  return {
    title: frontmatter?.title,
    description: frontmatter?.description,
  };
}
//TODO: Submenu
export default async function DocsPage({
  params: { folders },
}: {
  params: { folders: string[] };
}) {
  const {
    content: html,
    frontmatter,
    headings,
  } = await getMarkDownData(folders);
  if (!frontmatter) return notFound();
  const toc = await getToc(headings);
  console.log(toc);

  return (
    <div className="flex flex-row items-start gap-12 pt-5 ">
      <div className="flex-[1] sticky top-28 max-[800px]:hidden">
        <Leftbar />
      </div>
      <div className="flex-[3]">
        <div className="prose dark:prose-zinc dark:prose-invert dark:prose-code:bg-zinc-900 prose-code:bg-zinc-100 prose-code:text-zinc-800 dark:prose-code:text-zinc-50 prose-img:rounded-md ">
          <h1>{frontmatter.title}</h1>
          <p>{frontmatter.description}</p>
          {html}
        </div>
        <Pagination currentUrl={folders.join("/")} />
      </div>
      <div className="flex-[1] sticky top-28 max-[1100px]:hidden">
        <Toc headings={headings} />
        <div className="flex flex-col gap-2 mt-3 text-sm dark:text-zinc-400 border-t-2 dark:border-zinc-800 border-zinc-200 ">
          <Link
            href={
              process.env.GITHUB_PROJECT_CONTENT_URL +
              folders.join("/") +
              ".mdx"
            }
            className="hover:underline underline-offset-2  mt-2"
          >
            Edit this page on GitHub
          </Link>
          <ScrollTop />
        </div>
      </div>
    </div>
  );
}
