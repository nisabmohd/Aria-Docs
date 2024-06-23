"use client";

import { FileTextIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { FLATTEND_ROUTES } from "@/lib/routes-config";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDeferredValue, useMemo, useState } from "react";
import Anchor from "./anchor";

export default function Search() {
  const [searchedInput, setSearchedInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredResults = useMemo(
    () =>
      FLATTEND_ROUTES.filter((item) =>
        item.title.toLowerCase().includes(searchedInput.toLowerCase())
      ),
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
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <Input
              className="w-full rounded-md border py-2 pl-10 pr-4 text-sm shadow-sm "
              placeholder="Search documentation..."
              type="search"
            />
          </div>
        </DialogTrigger>
        <DialogContent className="p-0 max-w-[650px] sm:top-[38%] top-[45%]">
          <DialogHeader>
            <input
              value={searchedInput}
              onChange={(e) => setSearchedInput(e.target.value)}
              placeholder="Type something to search..."
              autoFocus
              className="h-14 px-4 bg-transparent border-b  outline-none"
            />
          </DialogHeader>
          {filteredResults.length == 0 && (
            <p className="text-muted-foreground mx-auto mt-2 text-sm">
              No results found for{" "}
              <span className="dark:text-white text-black">{`"${searchedInput}"`}</span>
            </p>
          )}
          <ScrollArea className="max-h-[350px]">
            <div className="flex flex-col items-start overflow-y-auto sm:px-3 px-1 pb-4 gap-0.5">
              {filteredResults.map((item) => (
                <DialogClose
                  onChange={(val) => console.log(val)}
                  key={item.href}
                  asChild
                >
                  <Anchor
                    className="dark:hover:bg-neutral-900 hover:bg-neutral-100 w-full p-2.5 px-3 rounded-sm text-[15px] flex items-center gap-2.5"
                    href={`/docs/${item.href}`}
                    disabled={item.disabled}
                  >
                    <FileTextIcon className="h-[1.1rem] w-[1.1rem]" />{" "}
                    {item.title}
                  </Anchor>
                </DialogClose>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
