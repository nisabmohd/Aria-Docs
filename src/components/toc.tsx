import { createSlug } from "@/lib/docs";

export default function Toc({ headings }: { headings: string[] }) {
  return (
    <ol className="text-sm dark:text-zinc-400 flex flex-col gap-2 pl-1">
      {headings.map((item) => (
        <li key={item}>
          <a tabIndex={-1} href={"#" + createSlug(item)}>
            {item}
          </a>
        </li>
      ))}
    </ol>
  );
}
