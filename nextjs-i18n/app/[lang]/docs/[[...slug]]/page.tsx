import Pagination from "@/components/pagination";
import Toc from "@/components/toc";
import { page_routes } from "@/lib/routes-config";
import { notFound } from "next/navigation";
import { getDocsForSlug } from "@/lib/markdown";
import { Typography } from "@/components/typography";
import { getDictionary, LangProps } from "@/lib/dictionaries";

type PageProps = {
  params: Promise<{ slug: string[] }>;
} & LangProps;

export default async function DocsPage(props: PageProps) {
  const params = await props.params;

  const { slug = [], lang } = params;
  const slugWithLang = [lang, ...slug];
  const dict = await getDictionary(lang);
  const pathName = slugWithLang.join("/");
  const res = await getDocsForSlug(pathName);

  if (!res) notFound();
  return (
    <div className="flex items-start gap-10">
      <div className="flex-[4.5] pt-10">
        <Typography>
          <h1 className="text-3xl !-mt-1.5">{res.frontmatter.title}</h1>
          <p className="-mt-4 text-muted-foreground text-[16.5px]">
            {res.frontmatter.description}
          </p>
          <div>{res.content}</div>
          <Pagination pathname={slug.join("/")} dict={dict} />
        </Typography>
      </div>
      <Toc path={pathName} dict={dict} />
    </div>
  );
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const { slug = [], lang } = params;
  const slugWithLang = [lang, ...slug];
  const pathName = slugWithLang.join("/");
  const res = await getDocsForSlug(pathName);
  if (!res) return {};
  const { frontmatter } = res;
  return {
    title: frontmatter.title,
    description: frontmatter.description,
  };
}

export function generateStaticParams() {
  return page_routes.map((item) => ({
    slug: item.href.split("/").slice(1),
  }));
}
