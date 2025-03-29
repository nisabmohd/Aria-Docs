"use client"; // Error components must be Client Components

import { useDictionary } from "@/components/contexts/dictionary-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dict = useDictionary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[87vh] px-2 sm:py-28 py-36 flex flex-col gap-4 items-center">
      <div className="text-center flex flex-col items-center justify-center w-fit gap-2">
        <h2 className="text-7xl font-bold pr-1">{dict.error.oops}</h2>
        <p className="text-muted-foreground text-md font-medium">
          {dict.error.something_went_wrong} {":`("}
        </p>
        <p>{dict.error.sub_text}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          {dict.error.reload_page}
        </Button>
        <Link href="/" className={buttonVariants({})}>
          {dict.error.back_to_homepage}
        </Link>
      </div>
    </div>
  );
}
