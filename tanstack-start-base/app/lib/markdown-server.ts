import path from "path";
import { promises as fs } from "fs";
import {
  justGetFrontmatterFromMD,
  sluggify,
  type BlogMdxFrontmatter,
} from "./markdown";

function getDocsContentPath(slug: string) {
  return path.join(process.cwd(), "/app/contents/docs/", `${slug}/index.mdx`);
}

export async function getDocsRawFromSlug(slug: string) {
  try {
    const contentPath = getDocsContentPath(slug);
    return await fs.readFile(contentPath, "utf-8");
  } catch (err) {
    console.log(err);
  }
}

export async function getDocsTocs(slug: string) {
  try {
    const contentPath = getDocsContentPath(slug);
    const rawMdx = await fs.readFile(contentPath, "utf-8");
    // captures between ## - #### can modify accordingly
    const headingsRegex = /^(#{2,4})\s(.+)$/gm;
    let match;
    const extractedHeadings: { level: any; text: any; href: string }[] = [];
    while ((match = headingsRegex.exec(rawMdx)) !== null) {
      const headingLevel = match[1].length;
      const headingText = match[2].trim();
      const slug = sluggify(headingText);
      extractedHeadings.push({
        level: headingLevel,
        text: headingText,
        href: `#${slug}`,
      });
    }
    return extractedHeadings;
  } catch {
    return [];
  }
}

export async function getAllBlogsFrontmatter() {
  const blogFolder = path.join(process.cwd(), "/app/contents/blogs/");
  const files = await fs.readdir(blogFolder);
  const uncheckedRes = await Promise.all(
    files.map(async (file) => {
      if (!file.endsWith(".mdx")) return undefined;
      const filepath = path.join(process.cwd(), `/app/contents/blogs/${file}`);
      const rawMdx = await fs.readFile(filepath, "utf-8");
      return {
        ...justGetFrontmatterFromMD<BlogMdxFrontmatter>(rawMdx),
        slug: file.split(".")[0],
      };
    })
  );
  return uncheckedRes.filter((it) => !!it) as (BlogMdxFrontmatter & {
    slug: string;
  })[];
}

export async function getRawBlogForSlug(slug: string) {
  const blogFile = path.join(
    process.cwd(),
    "/app/contents/blogs/",
    `${slug}.mdx`
  );
  try {
    return await fs.readFile(blogFile, "utf-8");
  } catch {
    return undefined;
  }
}
