"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronRight } from "lucide-react";
import Leftbar from "./leftbar";
import { ScrollArea } from "./ui/scroll-area";

export default function SheetLeftbar() {
  return (
    <div className=" border-b-2 dark:border-zinc-800 border-zinc-200 mb-6 min-[800px]:hidden">
      <Sheet>
        <SheetTrigger>
          <span className="flex flex-row gap-2 items-center mb-3">
            <ChevronRight className="w-4 h-4" /> Menu
          </span>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex justify-center w-[260px] dark:border-zinc-800 border-zinc-200 pt-8"
        >
          <ScrollArea className="overflow-auto pt-6 pb-2">
            <Leftbar />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
