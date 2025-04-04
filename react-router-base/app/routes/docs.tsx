import { components, type BaseMdxFrontmatter } from "~/lib/markdown";
import type { Route } from "./+types/docs";
import { Typography } from "~/components/typography";
import { MDXRemote } from "next-mdx-remote";
import Pagination from "~/components/pagination";
import DocsBreadcrumb from "~/components/docs-breadcrumb";
import Toc from "~/components/toc";
import { getDocsForSlug, getDocsTocs } from "~/lib/markdown-server";
import { not_found } from "~/lib/utils";

export async function loader({ params }: Route.LoaderArgs) {
  let path = params["*"];
  const mdx = await getDocsForSlug(path);
  const tocs = await getDocsTocs(path);
  return { mdx, tocs };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data.mdx) return [];
  const { title, description } = data.mdx
    .frontmatter as unknown as BaseMdxFrontmatter;
  return [
    { title },
    {
      name: "description",
      content: description,
    },
  ];
}

export default function DocsPage({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData.mdx) throw new Error(not_found);

  let path = params["*"];
  const frontmatter = loaderData.mdx
    .frontmatter as unknown as BaseMdxFrontmatter;

  return (
    <div className="flex items-start gap-10">
      <div className="flex-[4.5] py-10 mx-auto">
        <div className="w-full mx-auto">
          <DocsBreadcrumb paths={path.split("/")} />
          <Typography>
            <h1 className="sm:text-3xl text-2xl !-mt-0.5">
              {frontmatter.title}
            </h1>
            <p className="-mt-4 text-muted-foreground sm:text-[16.5px] text-[14.5px]">
              {frontmatter.description}
            </p>
            <div>
              <MDXRemote {...loaderData.mdx} components={components} />
            </div>
            <Pagination pathname={path} />
          </Typography>
        </div>
      </div>
      <Toc tocs={loaderData.tocs} />
    </div>
  );
}
