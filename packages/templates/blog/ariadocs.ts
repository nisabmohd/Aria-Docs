import { createDocs } from "@ariadocs/react";
import { remarkGfm, rehypePrism } from "@ariadocs/react/plugins";

export const docs = createDocs({
  contentDir: "data/contents",
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypePrism],
});
