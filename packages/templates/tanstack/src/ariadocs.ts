// ariadocs.ts
import { createDocs, type DocsConfig } from "@ariadocs/react";
import {
  remarkGfm,
  rehypePrism,
  rehypeAutolinkHeadings,
  rehypeSlug,
  rehypeCodeTitles,
  rehypeCodeRaw,
} from "@ariadocs/react/plugins";

export const docsConfig: DocsConfig = {
  contentDir: "src/data/contents",
  rehypePlugins: [
    rehypeCodeRaw,
    rehypeCodeTitles,
    rehypePrism,
    rehypeSlug,
    rehypeAutolinkHeadings,
  ],
  remarkPlugins: [remarkGfm],
};

export const docs = createDocs(docsConfig);
