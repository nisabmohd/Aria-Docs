import { TocItem } from "@ariadocs/react";
import Link from "next/link";

export function TableOfContents({ toc }: { toc: TocItem[] }) {
  if (!toc.length) return null;
  return (
    <aside className="not-prose fixed right-20 top-14 hidden w-48 xl:block">
      <nav className="text-sm">
        <p className="mb-2 font-semibold">On this page</p>
        <ul className="space-y-2">
          {toc.map((item) => (
            <li key={item.href} style={{ paddingLeft: (item.depth - 1) * 12 }}>
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {item.value}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
