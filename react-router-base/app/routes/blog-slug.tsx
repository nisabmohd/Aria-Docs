import {
  components,
  type Author,
  type BlogMdxFrontmatter,
} from "~/lib/markdown";
import type { Route } from "./+types/blog-slug";
import { MDXRemote } from "next-mdx-remote";
import { Typography } from "~/components/typography";
import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { formatDate, not_found } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getBlogForSlug } from "~/lib/markdown-server";

export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;
  const res = await getBlogForSlug(slug);
  return res;
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [];
  const { title, description } =
    data.frontmatter as unknown as BlogMdxFrontmatter;
  return [
    { title },
    {
      name: "description",
      content: description,
    },
  ];
}

export default function BloogWithSlug({ loaderData }: Route.ComponentProps) {
  if (!loaderData) throw new Error(not_found);
  const frontmatter = loaderData.frontmatter as unknown as BlogMdxFrontmatter;

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
            src={loaderData.frontmatter.cover}
            alt="cover"
            width={700}
            height={400}
            className="w-full h-[400px] rounded-md border object-cover"
          />
        </div>
        <Typography>
          <MDXRemote {...loaderData} components={components} />
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
