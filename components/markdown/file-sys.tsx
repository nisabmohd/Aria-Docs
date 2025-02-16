"use client";

import { useMemo, useState } from "react";
import {
  FileOrFolderType,
  FileType,
  FolderType,
  isFile,
  sortFileAndFolder,
} from "./files";
import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FileSys({
  items: children,
  sorted = false,
}: {
  items: FileOrFolderType[];
  sorted?: boolean;
}) {
  const items = useMemo(() => {
    if (sorted && children) return sortFileAndFolder(children);
    return children;
  }, [sorted, children]);

  return (
    <div className="dark:bg-stone-950/25 bg-stone-50/25 rounded-md p-4 px-3 border flex flex-col gap-1.5 font-code max-w-full overflow-x-auto">
      {items.map((f) => {
        if (isFile(f)) return <File {...f} key={f.name} />;
        return <Folder {...f} key={f.name} sorted={sorted} />;
      })}
    </div>
  );
}

function File({ name, highlight, indicator }: FileType) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 w-full hover:dark:bg-neutral-900 hover:bg-neutral-100 px-3 py-1 rounded-md relative",
        highlight && "dark:text-blue-400 text-blue-500"
      )}
    >
      <FileIcon className="sm:min-w-[1.2rem] sm:min-h-[1.2rem] sm:w-[1.2rem] sm:h-[1.2rem] min-w-[1rem] min-h-[1rem] w-[1rem] h-[1rem] text-current" />
      <div className="sm:text-[15px] text-[13.5px]">
        {name}
        {indicator && (
          <span
            className={cn(
              "text-[13px] ml-3 px-1.5 rounded-md py-0.5 pb-1",
              indicator == "delete" &&
                "dark:text-red-400 text-red-500 bg-red-400/10",
              indicator == "add" &&
                "dark:text-green-400 text-green-500 bg-green-400/10"
            )}
          >
            {indicator == "delete" ? "remove" : "add"}
          </span>
        )}
      </div>
    </div>
  );
}

function Folder({
  name,
  children,
  isOpen: defaultOpen,
  highlight,
  sorted = false,
  indicator,
}: FolderType & { sorted?: boolean }) {
  const [isOpen, setIsOpen] = useState(() => {
    return defaultOpen ?? false;
  });

  const items = useMemo(() => {
    if (sorted && children) return sortFileAndFolder(children);
    return children;
  }, [sorted, children]);

  return (
    <div>
      <div
        className={cn(
          "cursor-pointer flex items-center gap-1.5 w-full hover:dark:bg-neutral-900 hover:bg-neutral-00 px-3 py-1 rounded-md",
          highlight && "dark:text-blue-400 text-blue-500"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <FolderOpenIcon className="sm:min-w-[1.2rem] sm:min-h-[1.2rem] sm:w-[1.2rem] sm:h-[1.2rem] min-w-[1rem] min-h-[1rem] w-[1rem] h-[1rem]" />
        ) : (
          <FolderIcon className="sm:min-w-[1.2rem] sm:min-h-[1.2rem] sm:w-[1.2rem] sm:h-[1.2rem] min-w-[1rem] min-h-[1rem] w-[1rem] h-[1rem]" />
        )}
        <div className="sm:text-[15px] text-[13.5px]">
          {name}
          {indicator && (
            <span
              className={cn(
                "text-[13px] ml-3 px-1.5 rounded-md py-0.5 pb-1",
                indicator == "delete" &&
                  "dark:text-red-400 text-red-500 bg-red-400/10",
                indicator == "add" &&
                  "dark:text-green-400 text-green-500 bg-green-400/10"
              )}
            >
              {indicator == "delete" ? "remove" : "add"}
            </span>
          )}
        </div>
      </div>
      {isOpen && items?.length != 0 && (
        <div className="pl-2 pt-1 flex flex-col gap-1.5 border-l ml-5">
          {items?.map((f) => {
            if (isFile(f)) return <File {...f} key={f.name} />;
            return <Folder {...f} key={f.name} />;
          })}
        </div>
      )}
    </div>
  );
}
