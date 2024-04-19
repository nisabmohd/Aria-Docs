import { getPreviousNext } from "@/lib/markdown";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function Pagination({ pathname }: { pathname: string }) {
  const res = getPreviousNext(pathname);

  return (
    <div className="flex items-center justify-between py-5">
      <div>
        {res.prev && (
          <Link
            className={buttonVariants({ variant: "link" })}
            href={res.prev.disabled ? "#" : `/docs/${res.prev.href}`}
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <p>{res.prev.title}</p>
          </Link>
        )}
      </div>
      <div>
        {res.next && (
          <Link
            className={buttonVariants({ variant: "link" })}
            href={res.next.disabled ? "#" : `/docs/${res.next.href}`}
          >
            <p>{res.next.title}</p>
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
