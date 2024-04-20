import { getPreviousNext } from "@/lib/markdown";
import { buttonVariants } from "./ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Anchor from "./anchor";

export default function Pagination({ pathname }: { pathname: string }) {
  const res = getPreviousNext(pathname);

  return (
    <div className="flex items-center justify-between py-5">
      <div>
        {res.prev && (
          <Anchor
            className={buttonVariants({ variant: "link", className: "px-0" })}
            href={`/docs/${res.prev.href}`}
            disabled={res.prev.disabled}
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <p>{res.prev.title}</p>
          </Anchor>
        )}
      </div>
      <div>
        {res.next && (
          <Anchor
            className={buttonVariants({ variant: "link", className: "px-0" })}
            href={`/docs/${res.next.href}`}
            disabled={res.next.disabled}
          >
            <p>{res.next.title}</p>
            <ChevronRightIcon className="w-4 h-4" />
          </Anchor>
        )}
      </div>
    </div>
  );
}
