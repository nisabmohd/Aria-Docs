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
          rehypePlugins: [rehypePrism],
          remarkPlugins: [remarkGfm],
        },
      },

      components,
    });
  } catch (err) {
    return {
      content: null,
      frontmatter: null,
    };
  }
}

export function search(query: string) {}
