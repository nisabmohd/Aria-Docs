import FileSys from "./file-sys";

export type FileType = {
  type: "file";
  name: string;
  highlight?: boolean;
  indicator: "add" | "delete";
};

export type FileOrFolderType = FolderType | FileType;
export type FolderType = {
  type: "folder";
  name: string;
  highlight?: boolean;
  isOpen?: boolean;
  indicator: "add" | "delete";
  children?: FileOrFolderType[];
};

export function isFile(f: FileOrFolderType): f is FileType {
  return f.type == "file";
}

export function sortFileAndFolder(items: FileOrFolderType[]) {
  return [...items.sort((a, b) => a.name.localeCompare(b.name))];
}

export default function Files(props: {
  items: FileOrFolderType[];
  sorted?: boolean;
}) {
  return <FileSys {...props} />;
}
