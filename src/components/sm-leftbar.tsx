"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronRight } from "lucide-react";
import Leftbar from "./leftbar";
export default function SheetLeftbar() {
  return (
    <div className=" border-b-2 dark:border-zinc-800 border-zinc-200 mb-6 md:hidden">
      <Sheet>
        <SheetTrigger>
          <span className="flex flex-row gap-2 items-center mb-3">
            <ChevronRight className="w-4 h-4" /> Menu
          </span>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex justify-center w-[260px] dark:border-zinc-800 border-zinc-200 pt-8 no-scroll-bar"
        >
          <div className="overflow-auto pt-6 pb-2 no-scroll-bar ">
            <Leftbar />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
