"use client";

import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { File } from "lucide-react";
import { search } from "@/lib/search";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Search() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ReturnType<typeof search>>(
    []
  );

  useEffect(() => {
    const results = search(searchQuery);
    setSearchResults(results);
  }, [searchQuery]);

  return (
    <div>
      <Input
        className="text-[13.25px]"
        placeholder="Search documentation..."
        onFocus={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
        <DialogContent className="sm:max-w-[475px] max-h-[400px] px-0 ">
          <div className="grid gap-4 border-b-2 dark:border-zinc-800 border-zinc-200  -mt-6 px-4">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="col-span-3 border-none h-11 text-sm bg-transparent outline-none"
              placeholder="Search documentation"
            />
          </div>
          <div>
            <ScrollArea className="py-1 px-4 h-[327px] overflow-auto">
              <div className="text-sm dark:text-zinc-400 flex flex-col gap-2">
                {searchResults.map((item) => {
                  return (
                    <Link
                      onClick={() => setOpen(false)}
                      href={item.href}
                      key={item.href + item.title}
                      className="flex flex-row items-center gap-2 hover:dark:bg-zinc-800 hover:bg-zinc-100 px-2 py-2 rounded-md"
                    >
                      <File className="w-4 h-4" /> {item.title}
                    </Link>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
