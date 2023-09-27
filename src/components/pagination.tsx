import { getPreviousAndNext } from "@/lib/search";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type PaginationProps = {
  currentUrl: string;
};
export default function Pagination({ currentUrl }: PaginationProps) {
  const { previous, next } = getPreviousAndNext(currentUrl);
  return (
    <div className="border-t-2 dark:border-zinc-800 border-zinc-200 mt-12 pt-8 flex flex-row items-center justify-between">
      <div>
        {previous && (
          <Link href={previous.href} className="flex flex-col gap-1">
            <span className="text-sm text-zinc-400">Previous</span>
            <div className="flex flex-row items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <p className="text-[14.5px] font-semibold">{previous?.title}</p>
            </div>
          </Link>
        )}
      </div>
      <div>
        {next && (
          <Link href={next.href} className="flex flex-col gap-1">
            <span className="text-sm text-zinc-400">Next</span>
            <div className="flex flex-row items-center gap-2">
              <p className="text-[14.5px] font-semibold">{next?.title}</p>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
