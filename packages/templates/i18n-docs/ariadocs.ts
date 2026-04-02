import { createDocs } from "@ariadocs/react";
import {
  remarkGfm,
  rehypePrism,
  rehypeAutolinkHeadings,
  rehypeSlug,
  rehypeCodeTitles,
  rehypeCodeRaw,
} from "@ariadocs/react/plugins";
import Counter from "./components/counter";

export const docs = createDocs({
  contentDir: "data/contents",
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeCodeRaw,
    rehypeCodeTitles,
    rehypePrism,
    rehypeSlug,
    rehypeAutolinkHeadings,
  ],
  mdxComponents: {
    Counter,
  },
});
