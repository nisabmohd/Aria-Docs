"use client";

import { CommandIcon, FileTextIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { page_routes } from "@/lib/routes-config";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useMemo, useState } from "react";
import Anchor from "./anchor";

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
    () =>
      page_routes.filter((item) =>
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
          <div className="relative flex-1 max-w-md cursor-pointer">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <Input
              className="w-full rounded-md border py-2 pl-10 pr-4 text-sm shadow-sm "
              placeholder="Search documentation..."
              type="search"
            />
            <div className="sm:flex hidden absolute top-1/2 -translate-y-1/2 right-2 text-xs text-muted-foreground items-center gap-0.5 bg-muted p-1 rounded-md">
              <CommandIcon className="w-3 h-3" />
              <span>k</span>
            </div>
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
          {filteredResults.length == 0 && searchedInput && (
            <p className="text-muted-foreground mx-auto mt-2 text-sm">
              No results found for{" "}
              <span className="text-primary">{`"${searchedInput}"`}</span>
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
                    activeClassName="dark:bg-neutral-900 bg-neutral-100"
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
