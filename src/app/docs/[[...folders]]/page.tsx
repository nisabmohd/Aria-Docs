import { getMarkdown } from "@/lib/docs";
import React from "react";

export default async function DocsPage({
  params: { folders },
}: {
  params: { folders: string[] };
}) {
  const { content: html, frontmatter } = await getMarkdown(folders);
  if (!frontmatter) return <>Not found</>;
  return (
    <div className="w-[45%] mx-auto prose dark:prose-invert">
      <h1>{frontmatter.title}</h1>
      <p>{frontmatter.description}</p>
      {html}
    </div>
  );
}
