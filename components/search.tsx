"use client";

import { CommandIcon, FileTextIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useMemo, useState } from "react";
import Anchor from "./anchor";
import { advanceSearch, cn } from "@/lib/utils";

export default function Search() {
  const [searchedInput, setSearchedInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filteredResults = useMemo(
    () => advanceSearch(searchedInput.trim()),
    [searchedInput]
  );

  return (
    <div>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) setSearchedInput("");
          setIsOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <div className="relative flex-1 max-w-md cursor-pointer">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <Input
              className="md:w-full rounded-md bg-muted border h-9 pl-10 pr-4 text-sm shadow-sm "
              placeholder="Search documentation..."
              type="search"
            />
            <div className="sm:flex hidden absolute top-1/2 -translate-y-1/2 right-2 text-xs font-medium font-mono items-center gap-0.5 dark:bg-neutral-700 bg-zinc-200 p-1 rounded-sm">
              <CommandIcon className="w-3 h-3" />
              <span>k</span>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="p-0 max-w-[650px] sm:top-[38%] top-[45%]">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogHeader>
            <input
              value={searchedInput}
              onChange={(e) => setSearchedInput(e.target.value)}
              placeholder="Type something to search..."
              autoFocus
              className="h-14 px-4 bg-transparent border-b text-[15px] outline-none"
            />
          </DialogHeader>
          {filteredResults.length == 0 && searchedInput && (
            <p className="text-muted-foreground mx-auto mt-2 text-sm">
              No results found for{" "}
              <span className="text-primary">{`"${searchedInput}"`}</span>
            </p>
          )}
          <ScrollArea className="max-h-[350px]">
            <div className="flex flex-col items-start overflow-y-auto sm:px-3 px-1 pb-4">
              {filteredResults.map((item) => {
                const level = (item.href.split("/").slice(1).length -
                  1) as keyof typeof paddingMap;
                const paddingClass = paddingMap[level];

                return (
                  <DialogClose key={item.href} asChild>
                    <Anchor
                      className={cn(
                        "dark:hover:bg-neutral-900 hover:bg-neutral-100 w-full px-3 rounded-sm text-[15px] flex items-center gap-2.5",
                        paddingClass
                      )}
                      href={`/docs${item.href}`}
                    >
                      <div
                        className={cn(
                          "flex items-center w-fit h-full py-3 gap-1.5",
                          level > 1 && "border-l pl-4"
                        )}
                      >
                        <FileTextIcon className="h-[1.1rem] w-[1.1rem]" />{" "}
                        {item.title}
                      </div>
                    </Anchor>
                  </DialogClose>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const paddingMap = {
  1: "pl-2",
  2: "pl-4",
  3: "pl-10",
  // Add more levels if needed
} as const;
