import React from "react";
import { getExampleForSlug } from "@/lib/markdown";
import { ExamplesBreadcrumb } from "@/components/docs-breadcrumb";
import { ExamplePagination } from "@/components/pagination";
import { Typography } from "@/components/typography";
import { Example_page_routes } from "@/lib/routes-config";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function Page(props: PageProps) {
  const params = await props.params;

  const { slug = [] } = params;

  const pathName = slug.join("/");
  const res = await getExampleForSlug(pathName);

  return (
    <div className="flex items-start gap-10">
      <div className="flex-[4.5] pt-10">
        <ExamplesBreadcrumb paths={slug} />
        <Typography>
          <h1 className="text-3xl !-mt-0.5">{res?.frontmatter.title}</h1>
          <p className="-mt-4 text-muted-foreground text-[16.5px]">
            {res?.frontmatter.description}
          </p>
          <div>{res?.content}</div>
          <ExamplePagination pathname={pathName} />
        </Typography>
      </div>
      {/* <Toc path={pathName} /> */}
    </div>
  );
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;

  const { slug = [] } = params;

  const pathName = slug.join("/");
  const res = await getExampleForSlug(pathName);
  if (!res) return null;
  const { frontmatter } = res;
  return {
    title: frontmatter.title,
    description: frontmatter.description,
  };
}

export function generateStaticParams() {
  return Example_page_routes.map((item) => ({
    slug: item.href.split("/").slice(1),
  }));
}
