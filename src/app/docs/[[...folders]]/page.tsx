import { getMarkdown } from "@/lib/docs";
import React from "react";
import Balancer from "react-wrap-balancer";

export default async function DocsPage({
  params: { folders },
}: {
  params: { folders: string[] };
}) {
  const { content: html, frontmatter } = await getMarkdown(folders);
  if (!frontmatter) return <>Not found</>;
  return (
    <div className="prose dark:prose-invert prose-code:bg-zinc-900 dark:prose-code:text-zinc-50">
      <h1>{frontmatter.title}</h1>
      <p>{frontmatter.description}</p>
      {html}
    </div>
  );
}
