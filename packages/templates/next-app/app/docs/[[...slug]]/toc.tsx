import { type TocItem } from "@ariadocs/react";

export default function TableOfContents({ toc }: { toc: TocItem[] }) {
  return (
    <nav>
      <ul>
        {toc.map((item) => (
          <li key={item.href} style={{ paddingLeft: (item.depth - 1) * 16 }}>
            <a href={item.href}>{item.value}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
