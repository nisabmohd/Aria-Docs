import Toc from "@/components/toc";
import { getMarkdownForSlug } from "@/lib/markdown";
import { notFound } from "next/navigation";

export default async function DocsPage({
  params: { slug = [] },
}: {
  params: { slug: string[] };
}) {
  const pathName = slug.join("/");
  const res = await getMarkdownForSlug(pathName);
  if (!res) notFound();
  return (
    <div className="flex items-start gap-9">
      <div className="flex-[3] py-8 prose prose-slate dark:prose-invert max-w-full prose-code:font-code prose-code:bg-slate-800 prose-pre:bg-slate-800 prose-headings:scroll-m-20">
        <h1>{res.frontmatter.title}</h1>
        <p className="-mt-5 text-muted-foreground text-lg mb-4">
          {res.frontmatter.description}
        </p>
        {res.content}
      </div>
      <Toc path={pathName} />
    </div>
  );
}
