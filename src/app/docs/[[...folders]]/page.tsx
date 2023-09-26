import { getMarkdown } from "@/lib/docs";
import React from "react";
import { notFound } from "next/navigation";
import Leftbar from "@/components/leftbar";

export default async function DocsPage({
  params: { folders },
}: {
  params: { folders: string[] };
}) {
  const { content: html, frontmatter } = await getMarkdown(folders);
  if (!frontmatter) return notFound();
  return (
    <div className="flex flex-row items-start gap-8 pt-5 ">
      <div className="flex-[1] sticky top-28 max-[800px]:hidden">
        <Leftbar />
      </div>
      <div className="flex-[3]">
        <div className="prose dark:prose-invert prose-code:bg-zinc-900 dark:prose-code:text-zinc-50">
          <h1>{frontmatter.title}</h1>
          <p>{frontmatter.description}</p>
          {html}
        </div>
      </div>
      <div className="flex-[1] sticky top-28 max-[1100px]:hidden">
        <ol className="text-sm dark:text-zinc-400 flex flex-col gap-2 pl-1">
          <li>Introduction</li>
          <li>What is next.js?</li>
          <li> How to Use These Docs</li>
          <li> App Router vs Pages Router</li>
          <li> Pre-Requisite Knowledge</li>
          <li>Accessibility Join our Community</li>
          <span></span>
          <li>Edit this page on GitHub</li>
          <li>Scroll to top</li>
        </ol>
      </div>
    </div>
  );
}
