import { getAllBlogs } from "@/lib/markdown";
import Link from "next/link";

// TODO: add UI for this page
export default async function BlogIndexPage() {
  const blogs = await getAllBlogs();
  return (
    <div className="w-full flex flex-col items-center gap-5 sm:min-h-[91vh] min-h-[88vh] ">
      <h1 className="text-2xl font-extrabold">
        The latest blogs of this product
      </h1>
      {blogs.map((blog) => (
        <Link href={`/blog/${blog.slug}`} key={blog.slug}>
          {blog.frontmatter.title}
        </Link>
      ))}
    </div>
  );
}
