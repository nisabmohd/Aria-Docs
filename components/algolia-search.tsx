"use client";

import { DocSearch } from "@docsearch/react";
import "@docsearch/css";

type AlgoliaProps = {
  appId: string;
  indexName: string;
  apiKey: string;
};

export default function AlgoliaSearch(props: AlgoliaProps) {
  return (
    <div className="relative border rounded-lg sm:w-fit w-[68%]">
      <div className="absolute right-2 top-[0.4rem] hidden items-center gap-0.5 text-xs font-code sm:flex pointer-events-none">
        <div className="bg-background/30 border rounded-md py-0.5 px-1 dark:border-neutral-700 border-neutral-300">
          Ctrl
        </div>
        <div className="bg-background/30 border rounded-md py-0.5 px-[0.28rem] dark:border-neutral-700 border-neutral-300">
          K
        </div>
      </div>
      <DocSearch {...props} maxResultsPerGroup={5} />
      <div className="absolute top-[0.42rem] left-24 text-muted-foreground font-code -tracking-[0.1rem] text-sm pl-[0.081rem] pointer-events-none">
        ...
      </div>
    </div>
  );
}
