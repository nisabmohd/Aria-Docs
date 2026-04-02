"use client";
import { useDictionary } from "@/components/dict-provider";
// intentionally made this as client component

import { type TocItem } from "@ariadocs/react";

export default function TableOfContents({ toc }: { toc: TocItem[] }) {
  const dict = useDictionary();
  return (
    <nav>
      <h3>{dict.nav.toc}</h3>
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
