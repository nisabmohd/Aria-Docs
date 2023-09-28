import path from "path";
import { promises as fs } from "fs";
import { compileMDX } from "next-mdx-remote/rsc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Terminal } from "lucide-react";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeCodeTitles from "rehype-code-titles";
import Anchor from "@/components/md/anchor";
import Highlight from "@/components/md/hightlight";
import Tag from "@/components/md/tag";

type MDXFrontmatter = {
  title: string;
  description: string;
};

const components = {
  Alert,
  AlertDescription,
  AlertTitle,
  Terminal,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  a: Anchor,
  Link: Anchor,
  Highlight,
  Tag,
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
    return {
      content: null,
      frontmatter: null,
    };
  }
}
