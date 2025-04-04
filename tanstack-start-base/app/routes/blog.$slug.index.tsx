import { Typography } from "@/components/typography";
import { buttonVariants } from "@/components/ui/button";
import {
  Author,
  BlogMdxFrontmatter,
  components,
  compileRaw,
} from "@/lib/markdown";
import { getRawBlogForSlug } from "@/lib/markdown-server";
import { formatDate } from "@/lib/utils";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { MDXRemote } from "next-mdx-remote";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const blogServerFunctionParamSchems = z.object({
  slug: z.string(),
});

export const getBlogRawServerFn = createServerFn()
  .validator((param: unknown) => {
    return blogServerFunctionParamSchems.parse(param);
  })
  .handler(async ({ data }) => {
    return await getRawBlogForSlug(data.slug);
  });

export const Route = createFileRoute("/blog/$slug/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { slug } = params;
    const rawBlog = await getBlogRawServerFn({ data: { slug } });
    if (!rawBlog) throw notFound();
    const res = await compileRaw(rawBlog);
    return { mdx: res };
  },
  head: ({ loaderData }) => {
    const { mdx } = loaderData!;
    const { title, description } =
      mdx.frontmatter as unknown as BlogMdxFrontmatter;
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
  const blogData = Route.useLoaderData();
  const frontmatter = blogData.mdx.frontmatter as unknown as BlogMdxFrontmatter;

  return (
    <div className="lg:w-[60%] sm:[95%] md:[75%] mx-auto">
      <Link
        className={buttonVariants({
          variant: "link",
          className: "!mx-0 !px-0 mb-7 !-ml-1 ",
        })}
        to="/blog"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1.5" /> Back to blog
      </Link>
      <div className="flex flex-col gap-3 pb-7 w-full mb-2">
        <p className="text-muted-foreground text-sm">
          {formatDate(frontmatter.date)}
        </p>
        <h1 className="sm:text-3xl text-2xl font-extrabold">
          {frontmatter.title}
        </h1>
        <div className="mt-6 flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Posted by</p>
          <Authors authors={frontmatter.authors} />
        </div>
      </div>
      <div className="!w-full">
        <div className="w-full mb-7">
          <img
            src={frontmatter.cover}
            alt="cover"
            width={700}
            height={400}
            className="w-full h-[400px] rounded-md border object-cover"
          />
        </div>
        <Typography>
          <MDXRemote {...blogData.mdx} components={components} />
        </Typography>
      </div>
    </div>
  );
}

function Authors({ authors }: { authors: Author[] }) {
  return (
    <div className="flex items-center gap-8 flex-wrap">
      {authors.map((author) => {
        return (
          <Link
            to={author.handleUrl}
            className="flex items-center gap-2"
            key={author.username}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={author.avatar} />
              <AvatarFallback>
                {author.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="">
              <p className="text-sm font-medium">{author.username}</p>
              <p className="font-code text-[13px] text-muted-foreground">
                @{author.handle}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
