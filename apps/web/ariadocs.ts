import { type DocsConfigLocal, LocalDocs } from "@ariadocs/react/core";
import {
  recommendedRehypePlugins,
  recommendedRemarkPlugins,
} from "@ariadocs/react/utils";

export const docsConfig: DocsConfigLocal = {
  contentDir: "/docs/contents",
  rehypePlugins: recommendedRehypePlugins,
  remarkPlugins: recommendedRemarkPlugins,
};

type F = { title: string };
export const docs = new LocalDocs<F>(docsConfig);
