import { PropsWithChildren } from "react";

export function Typography({ children }: PropsWithChildren) {
  return (
    <div className="prose prose-zinc dark:prose-invert prose-code:font-code dark:prose-code:bg-stone-950/95 dark:prose-pre:bg-stone-950/95 prose-code:bg-stone-50 prose-pre:bg-stone-50 prose-headings:scroll-m-20 w-[85vw] sm:w-full sm:mx-auto prose-code:text-sm prose-code:leading-6 dark:prose-code:text-white prose-code:text-stone-800 prose-code:p-1 prose-code:rounded-md prose-pre:border pt-2 !min-w-full prose-img:rounded-md prose-img:border">
      {children}
    </div>
  );
}
