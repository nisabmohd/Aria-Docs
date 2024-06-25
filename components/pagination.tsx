import { getPreviousNext } from "@/lib/markdown";
import { buttonVariants } from "./ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

export default function Pagination({ pathname }: { pathname: string }) {
  const res = getPreviousNext(pathname);

  return (
    <div className="flex items-center justify-between sm:py-7 py-3">
      <div>
        {res.prev && (
          <Link
            className="flex items-center gap-2 no-underline text-sm px-1"
            href={`/docs/${res.prev.href}`}
          >
            <ChevronLeftIcon className="w-[1.1rem] h-[1.1rem]" />
            <p>{res.prev.title}</p>
          </Link>
        )}
      </div>
      <div>
        {res.next && (
          <Link
            className="flex items-center gap-2 no-underline text-sm px-1"
            href={`/docs/${res.next.href}`}
          >
            <p>{res.next.title}</p>
            <ChevronRightIcon className="w-[1.1rem] h-[1.1rem]" />
          </Link>
        )}
      </div>
    </div>
  );
}
