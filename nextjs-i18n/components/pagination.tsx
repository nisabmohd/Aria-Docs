import { getPreviousNext } from "@/lib/markdown";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { buttonVariants } from "./ui/button";
import LocalizedLink from "./localized-link";
import { Dictionary } from "@/lib/dictionaries";

export default function Pagination({
  pathname,
  dict,
}: {
  pathname: string;
  dict: Dictionary;
}) {
  const res = getPreviousNext(pathname);

  return (
    <div className="grid grid-cols-2 flex-grow sm:py-10 py-7 gap-3">
      <div>
        {res.prev && (
          <LocalizedLink
            className={buttonVariants({
              variant: "outline",
              className:
                "no-underline w-full flex flex-col pl-3 !py-8 !items-start",
            })}
            href={`/docs${res.prev.href}`}
          >
            <span className="flex items-center text-muted-foreground text-xs">
              <ChevronLeftIcon className="w-[1rem] h-[1rem] mr-1" />
              {dict.docs.previous}
            </span>
            <span className="mt-1 ml-1">
              {dict.leftbar[res.prev.title as keyof typeof dict.leftbar]}
            </span>
          </LocalizedLink>
        )}
      </div>
      <div>
        {res.next && (
          <LocalizedLink
            className={buttonVariants({
              variant: "outline",
              className:
                "no-underline w-full flex flex-col pr-3 !py-8 !items-end",
            })}
            href={`/docs${res.next.href}`}
          >
            <span className="flex items-center text-muted-foreground text-xs">
              {dict.docs.next}
              <ChevronRightIcon className="w-[1rem] h-[1rem] ml-1" />
            </span>
            <span className="mt-1 mr-1">
              {dict.leftbar[res.next.title as keyof typeof dict.leftbar]}
            </span>
          </LocalizedLink>
        )}
      </div>
    </div>
  );
}
