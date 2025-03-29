"use client";

import { useDictionary } from "@/components/contexts/dictionary-provider";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  const dict = useDictionary();

  return (
    <div className="min-h-[87vh] px-2 sm:py-28 py-36 flex flex-col gap-4 items-center">
      <div className="text-center flex flex-col items-center justify-center w-fit gap-2">
        <h2 className="text-7xl font-bold pr-1">{dict.not_found["404"]}</h2>
        <p className="text-muted-foreground text-md font-medium">
          {dict.not_found.page_not_found} {":("}
        </p>
        <p> {dict.not_found.sub_text}</p>
      </div>
      <Link href="/" className={buttonVariants({})}>
        {dict.not_found.back_to_homepage}
      </Link>
    </div>
  );
}
