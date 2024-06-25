import { getPreviousNext } from "@/lib/markdown";
import { buttonVariants } from "./ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

export default function Pagination({ pathname }: { pathname: string }) {
  const res = getPreviousNext(pathname);

  return (
    <div className="flex items-center justify-between py-7">
      <div>
        {res.prev && (
          <Link
            className={buttonVariants({
              variant: "link",
              className: "px-0 no-underline hover:no-underline",
            })}
            href={`/docs/${res.prev.href}`}
          >
            <ChevronLeftIcon className="w-[1.1rem] h-[1.1rem] mr-1.5" />
            <p>{res.prev.title}</p>
          </Link>
        )}
      </div>
      <div>
        {res.next && (
          <Link
            className={buttonVariants({
              variant: "link",
              className: "px-0 no-underline hover:no-underline",
            })}
            href={`/docs/${res.next.href}`}
          >
            <p>{res.next.title}</p>
            <ChevronRightIcon className="w-[1.1rem] h-[1.1rem] ml-1.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
