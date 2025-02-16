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
      <FileIcon className="min-w-[1.2rem] min-h-[1.2rem] w-[1.2rem] h-[1.2rem] text-current" />
      <div className="text-[15px]">
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
          <FolderOpenIcon className="min-w-[1.2rem] min-h-[1.2rem] w-[1.2rem] h-[1.2rem]" />
        ) : (
          <FolderIcon className="min-w-[1.2rem] min-h-[1.2rem] w-[1.2rem] h-[1.2rem]" />
        )}
        <div className="text-[15px]">
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
      {isOpen && (
        <div className="pl-5 pt-1 flex flex-col gap-1.5">
          {items?.map((f) => {
            if (isFile(f)) return <File {...f} key={f.name} />;
            return <Folder {...f} key={f.name} />;
          })}
        </div>
      )}
    </div>
  );
}
