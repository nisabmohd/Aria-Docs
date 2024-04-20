"use client";

import { FileIcon, SearchIcon } from "lucide-react";
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
import { useState } from "react";
import Anchor from "./anchor";

export default function Search() {
  const [searchedInput, setSearchedInput] = useState("");
  const filteredResults = FLATTEND_ROUTES.filter((item) =>
    item.title.toLowerCase().includes(searchedInput.toLowerCase())
  );
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              className="w-full rounded-md border border-gray-200  py-2 pl-10 pr-4 text-sm shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:border-gray-800  dark:text-gray-50 dark:focus:border-gray-700 dark:focus:ring-gray-700"
              placeholder="Search documentation..."
              type="search"
            />
          </div>
        </DialogTrigger>
        <DialogContent className="p-0 max-w-[550px]">
          <DialogHeader>
            <input
              value={searchedInput}
              onChange={(e) => setSearchedInput(e.target.value)}
              placeholder="Type something to search..."
              autoFocus
              className="h-12 px-4 bg-transparent border-b text-sm outline-none"
            />
          </DialogHeader>
          {filteredResults.length == 0 && (
            <p className="text-muted-foreground mx-auto mt-1">
              No results found.
            </p>
          )}
          <ScrollArea className="max-h-[350px]">
            <div className="flex flex-col items-start overflow-y-auto px-3 pb-4 gap-0.5">
              {filteredResults.map((item) => (
                <DialogClose key={item.href} asChild>
                  <Anchor
                    className="dark:hover:bg-neutral-800 hover:bg-neutral-100 w-full p-2.5 px-3 text-sm rounded-sm flex items-center gap-2"
                    href={`/docs/${item.href}`}
                    disabled={item.disabled}
                  >
                    <FileIcon className="h-[1.1rem] w-[1.1rem]" /> {item.title}
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
