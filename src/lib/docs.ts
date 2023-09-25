import path from "path";
import { promises as fs } from "fs";
import { compileMDX } from "next-mdx-remote/rsc";

type MDXFrontmatter = {
  title: string;
  description: string;
};

export async function getMarkdown(pathname: string[]) {
  try {
    const paths = pathname.join("/");
    const contentPath = path.join(process.cwd(), "src/content/docs/" + paths);
    const data = await fs.readFile(contentPath + ".mdx", "utf8");
    return await compileMDX<MDXFrontmatter>({
      source: data,
      options: {
        parseFrontmatter: true,
      },
    });
  } catch (err) {
    return {
      content: null,
      frontmatter: null,
    };
  }
}

export function search(query: string) {}
