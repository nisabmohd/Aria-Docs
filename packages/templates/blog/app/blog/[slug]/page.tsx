import { docs } from "@/ariadocs";

type BlogPagePropType = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPage({ params }: BlogPagePropType) {
  const { slug } = await params;
  const { MDX, frontmatter } = await docs.parse({ slug });
  return (
    <>
      <title>{frontmatter["title"]}</title>
      <article>{MDX}</article>
    </>
  );
}
