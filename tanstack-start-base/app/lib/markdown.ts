import { serialize } from "next-mdx-remote/serialize";

import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeCodeTitles from "rehype-code-titles";
import { page_routes, ROUTES } from "./routes-config";
import { visit } from "unist-util-visit";
import matter from "gray-matter";
import { getIconName, hasSupportedExtension } from "./utils";

// custom components imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Pre from "@/components/markdown/pre";
import Note from "@/components/markdown/note";
import { Stepper, StepperItem } from "@/components/markdown/stepper";
import Image from "@/components/markdown/image";
import Link from "@/components/markdown/link";
import Files from "@/components/markdown/files";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// add custom components
export const components = {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  pre: Pre,
  Note,
  Stepper,
  StepperItem,
  img: Image,
  a: Link,
  Files,
  table: Table,
  thead: TableHeader,
  th: TableHead,
  tr: TableRow,
  tbody: TableBody,
  t: TableCell,
};

export async function parseMdx(rawMdx: string) {
  return serialize(rawMdx, {
    parseFrontmatter: true,
    mdxOptions: {
      rehypePlugins: [
        preProcess,
        rehypeCodeTitles,
        rehypeCodeTitlesWithLogo,
        rehypePrism,
        rehypeSlug,
        rehypeAutolinkHeadings,
        postProcess,
      ],
      remarkPlugins: [remarkGfm],
    },
  });
}

// logic for docs

export type BaseMdxFrontmatter = {
  title: string;
  description: string;
};

export function getPreviousNext(path: string) {
  const index = page_routes.findIndex(({ href }) => href == `/${path}`);
  return {
    prev: page_routes[index - 1],
    next: page_routes[index + 1],
  };
}

export function sluggify(text: string) {
  const slug = text.toLowerCase().replace(/\s+/g, "-");
  return slug.replace(/[^a-z0-9-]/g, "");
}

export function justGetFrontmatterFromMD<Frontmatter>(
  rawMd: string
): Frontmatter {
  return matter(rawMd).data as Frontmatter;
}

// for copying the code in pre
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const preProcess = () => (tree: any) => {
  visit(tree, (node) => {
    if (node?.type === "element" && node?.tagName === "pre") {
      const [codeEl] = node.children;
      if (codeEl.tagName !== "code") return;
      node.raw = codeEl.children?.[0].value;
    }
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const postProcess = () => (tree: any) => {
  visit(tree, "element", (node) => {
    if (node?.type === "element" && node?.tagName === "pre") {
      node.properties["raw"] = node.raw;
    }
  });
};

export type Author = {
  avatar?: string;
  handle: string;
  username: string;
  handleUrl: string;
};

export type BlogMdxFrontmatter = BaseMdxFrontmatter & {
  date: string;
  authors: Author[];
  cover: string;
};

function rehypeCodeTitlesWithLogo() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    visit(tree, "element", (node) => {
      if (
        node?.tagName === "div" &&
        node?.properties?.className?.includes("rehype-code-title")
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const titleTextNode = node.children.find(
          (child: any) => child.type === "text"
        );
        if (!titleTextNode) return;

        // Extract filename and language
        const titleText = titleTextNode.value;
        const match = hasSupportedExtension(titleText);
        if (!match) return;

        const splittedNames = titleText.split(".");
        const ext = splittedNames[splittedNames.length - 1];
        const iconClass = `devicon-${getIconName(ext)}-plain text-[17px]`;

        // Insert icon before title text
        if (iconClass) {
          node.children.unshift({
            type: "element",
            tagName: "i",
            properties: { className: [iconClass, "code-icon"] },
            children: [],
          });
        }
      }
    });
  };
}

export async function compileRaw(rawMdx: string) {
  return await parseMdx(rawMdx);
}
