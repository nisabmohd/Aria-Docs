"use client";

import { DocSearch } from "@docsearch/react";
import "@docsearch/css";

type AlgoliaProps = {
  appId: string;
  indexName: string;
  apiKey: string;
};

export default function AlgoliaSearch(props: AlgoliaProps) {
  return <DocSearch {...props} />;
}
