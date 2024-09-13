import { buttonVariants } from "@/components/ui/button";
import { BlogMdxFrontmatter, getAllBlogs } from "@/lib/markdown";
import { formatDate2, stringToDate } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AriaDocs - Blog",
};

export default async function BlogIndexPage() {
  const blogs = (await getAllBlogs()).sort(
    (a, b) =>
      stringToDate(b.frontmatter.date).getTime() -
      stringToDate(a.frontmatter.date).getTime()
  );
  return (
    <div className="w-full flex flex-col gap-1 sm:min-h-[91vh] min-h-[88vh] md:pt-6 pt-2">
      <div className="mb-6 flex flex-col gap-2 ">
        <h1 className="text-3xl font-extrabold">
          The latest blogs of this product
        </h1>
        <p className="text-muted-foreground">
          All the latest blogs and news, straight from the team.
        </p>
      </div>
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
        {blogs.map((blog) => (
          <BlogCard {...blog.frontmatter} slug={blog.slug} key={blog.slug} />
        ))}
      </div>
    </div>
  );
}

function BlogCard({
  date,
  title,
  description,
  slug,
}: BlogMdxFrontmatter & { slug: string }) {
  return (
    <div className="flex flex-col gap-2 items-start border rounded-md p-5 pt-7">
      <Link
        href={`/blog/${slug}`}
        className="sm:text-lg text-lg font-semibold -mt-1"
      >
        {title}
      </Link>
      <p className="text-sm text-muted-foreground">{description}</p>
      <p className="text-[13px] text-muted-foreground mb-1">
        Published on {formatDate2(date)}
      </p>
      <Link
        href={`/blog/${slug}`}
        className={buttonVariants({
          className: "w-full mt-auto",
          variant: "secondary",
          size: "sm",
        })}
      >
        Read More
      </Link>
    </div>
  );
}
