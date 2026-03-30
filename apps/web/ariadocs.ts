import {
  createDocs,
  recommendedRehypePlugins,
  recommendedRemarkPlugins,
  type DocsConfig,
} from "@ariadocs/react";

export const docsConfig: DocsConfig = {
  contentDir: "contents/docs",
  rehypePlugins: recommendedRehypePlugins,
  remarkPlugins: recommendedRemarkPlugins,
};

export const docs = createDocs(docsConfig);
