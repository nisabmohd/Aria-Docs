"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { getPreviousNext } from "@/lib/routes-config";
import { useVersion } from "./context/version";

export default function Pagination({ pathname }: { pathname: string }) {
  const { currentVersion } = useVersion();
  const res = getPreviousNext(pathname, currentVersion);

  return (
    <div className="flex items-center justify-between sm:py-7 py-5">
      <div>
        {res.prev && (
          <Link
            className="flex items-center gap-2 no-underline text-sm px-1"
            href={`/docs/${currentVersion}${res.prev.href}`}
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
            href={`/docs/${currentVersion}${res.next.href}`}
          >
            <p>{res.next.title}</p>
            <ChevronRightIcon className="w-[1.1rem] h-[1.1rem]" />
          </Link>
        )}
      </div>
    </div>
  );
}
