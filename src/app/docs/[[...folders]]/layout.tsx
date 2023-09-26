import Leftbar from "@/components/leftbar";
import { PropsWithChildren } from "react";

export default function DocsLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-row items-start gap-8 pt-5">
      <div className="flex-[1] sticky top-28 max-[800px]:hidden">
        <Leftbar />
      </div>
      <div className="flex-[3]">{children}</div>
      <div className="flex-[1] sticky top-28 max-[1500px]:hidden">
        <ol className="text-sm dark:text-zinc-400 flex flex-col gap-2 pl-1">
          <li>Introduction</li>
          <li>What is next.js?</li>
          <li> How to Use These Docs</li>
          <li> App Router vs Pages Router</li>
          <li> Pre-Requisite Knowledge</li>
          <li>Accessibility Join our Community</li>
          <span></span>
          <li>Edit this page on GitHub</li>
          <li>Scroll to top</li>
        </ol>
      </div>
    </div>
  );
}
