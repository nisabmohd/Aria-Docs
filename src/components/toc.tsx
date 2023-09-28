export default function Toc({ headings }: { headings: string[] }) {
  return (
    <ol className="text-sm dark:text-zinc-400 flex flex-col gap-2 pl-1">
      {headings.map((item) => (
        <li key={item}>
          <a href={"#" + item.toLowerCase().replace(/\s+/g, "-")}>{item}</a>
        </li>
      ))}
    </ol>
  );
}
