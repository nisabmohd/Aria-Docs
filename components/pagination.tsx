import { getPreviousNext } from "@/lib/markdown";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";

export default function Pagination({ pathname }: { pathname: string }) {
  const res = getPreviousNext(pathname);

  return (
    <div className="grid grid-cols-2 sm:flex sm:justify-between flex-grow sm:py-7 py-5 gap-3">
      <div>
        {res.prev && (
          <Link
            className={buttonVariants({
              variant: "outline",
              className: "no-underline w-full flex justify-between pl-2 !py-6 ",
            })}
            href={`/docs${res.prev.href}`}
          >
            <ChevronLeftIcon className="w-[1.1rem] h-[1.1rem] mr-1" />
            <span>{res.prev.title}</span>
          </Link>
        )}
      </div>
      <div>
        {res.next && (
          <Link
            className={buttonVariants({
              variant: "outline",
              className: "no-underline w-full flex justify-between pr-2 !py-6 ",
            })}
            href={`/docs${res.next.href}`}
          >
            <span>{res.next.title}</span>
            <ChevronRightIcon className="w-[1.1rem] h-[1.1rem] ml-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
