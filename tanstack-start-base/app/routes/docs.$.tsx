import DocsBreadcrumb from "@/components/docs-breadcrumb";
import Pagination from "@/components/pagination";
import { Typography } from "@/components/typography";
import { BaseMdxFrontmatter, compileRaw, components } from "@/lib/markdown";
import { getDocsRawFromSlug, getDocsTocs } from "@/lib/markdown-server";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { MDXRemote } from "next-mdx-remote";
import Toc from "@/components/toc";
import { z } from "zod";

const docsServerFunctionParamSchems = z.object({
  path: z.string(),
});

export const getDocsRawServerFn = createServerFn()
  .validator((param: unknown) => {
    return docsServerFunctionParamSchems.parse(param);
  })
  .handler(async ({ data }) => {
    return await getDocsRawFromSlug(data.path);
  });

export const getDocsTocServerFn = createServerFn()
  .validator((param: unknown) => {
    return docsServerFunctionParamSchems.parse(param);
  })
  .handler(async ({ data }) => {
    return await getDocsTocs(data.path);
  });

export const Route = createFileRoute("/docs/$")({
  component: RouteComponent,
  loader: async ({ params }) => {
    let path = params._splat;

    if (!path) throw notFound();
    const raw = await getDocsRawServerFn({ data: { path } });
    if (!raw) throw notFound();
    const mdx = await compileRaw(raw);
    const tocs = await getDocsTocServerFn({ data: { path } });
    return { mdx, tocs };
  },

  head: ({ loaderData }) => {
    const { mdx } = loaderData!;
    const { title, description } =
      mdx.frontmatter as unknown as BaseMdxFrontmatter;
    return {
      meta: [
        {
          title,
        },
        {
          name: "description",
          content: description,
        },
      ],
    };
  },
});

function RouteComponent() {
  const docsData = Route.useLoaderData();
  const { _splat: path } = Route.useParams();

  if (!path) return null;

  const frontmatter = docsData.mdx
    ?.frontmatter as unknown as BaseMdxFrontmatter;

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
              <MDXRemote {...docsData.mdx} components={components} />
            </div>
            <Pagination pathname={path} />
          </Typography>
        </div>
      </div>
      <Toc tocs={docsData.tocs} />
    </div>
  );
}
