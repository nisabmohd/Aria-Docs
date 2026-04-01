import { createDocs } from "@ariadocs/react";
import { remarkGfm, rehypePrism } from "@ariadocs/react/plugins";

export const docs = createDocs({
  contentDir: "app/data/contents",
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypePrism],
});
