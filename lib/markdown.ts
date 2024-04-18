import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";
import { promises as fs } from "fs";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeCodeTitles from "rehype-code-titles";

type MdxFrontmatter = {
  title: string;
  description: string;
};

//TODO: add components
const components = {};

function getContentPath(slug: string) {
  return path.join(process.cwd(), "/contents/docs/", `${slug}.mdx`);
}

export async function getMarkdownForSlug(slug: string) {
  try {
    const contentPath = getContentPath(slug);
    const rawMdx = await fs.readFile(contentPath, "utf-8");
    return await compileMDX<MdxFrontmatter>({
      source: rawMdx,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          rehypePlugins: [
            rehypeCodeTitles,
            rehypePrism,
            rehypeSlug,
            rehypeAutolinkHeadings,
          ],
          remarkPlugins: [remarkGfm],
        },
      },
      components,
    });
  } catch (err) {
    console.log(err);
  }
}

export async function getToc(slug: string) {
  const contentPath = getContentPath(slug);
  const rawMdx = await fs.readFile(contentPath, "utf-8");

  const headingsRegex = /^(#{2,4})\s(.+)$/gm;
  let match;
  const extractedHeadings = [];
  while ((match = headingsRegex.exec(rawMdx)) !== null) {
    const headingLevel = match[1].length;
    const headingText = match[2].trim();
    extractedHeadings.push({ level: headingLevel, text: headingText });
  }
  return extractedHeadings;
}

//TODO:
export function getPreviousNext(path: string) {}

export function sluggify(text: string) {
  const slug = text.toLowerCase().replace(/\s+/g, "-");
  return slug.replace(/[^a-z0-9-]/g, "");
}
