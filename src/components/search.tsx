"use client";

import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { File } from "lucide-react";

export default function Search() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Input placeholder="Search Documentation" onFocus={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
        <DialogContent className="sm:max-w-[475px] px-0">
          <div className="grid gap-4 border-b-2 dark:border-zinc-800 border-zinc-200  -mt-6 px-4">
            <input
              className="col-span-3 border-none h-11 text-sm bg-transparent outline-none"
              placeholder="Search Documentation"
            />
          </div>
          <div>
            <div className="text-sm dark:text-zinc-400 flex flex-col gap-5 pt-1 px-4">
              <div className="flex flex-row items-center gap-2">
                <File className="w-4 h-4" /> Introduction
              </div>
              <div className="flex flex-row items-center gap-2">
                <File className="w-4 h-4" /> Installation
              </div>
              <div className="flex flex-row items-center gap-2">
                <File className="w-4 h-4" /> Project Structure
              </div>
              <div className="flex flex-row items-center gap-2">
                <File className="w-4 h-4" /> Routing
              </div>
              <div className="flex flex-row items-center gap-2">
                <File className="w-4 h-4" /> Caching
              </div>
              <div className="flex flex-row items-center gap-2">
                <File className="w-4 h-4" /> Data Fetching
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
