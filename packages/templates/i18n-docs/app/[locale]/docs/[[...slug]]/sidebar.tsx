import { docs } from "@/ariadocs";
import { type NavItem } from "@ariadocs/react";
import Link from "next/link";

export default function NavList({ items }: { items: NavItem[] }) {
  let visible = items.filter((it) => it.nav);
  return (
    <ul className="ml-2">
      {visible
        .filter((item) => item.nav)
        .map((item) => {
          return (
            <li key={item.href}>
              {item.items.length != 0 ? (
                <span>{item.title}</span>
              ) : (
                <LinkName slug={item.href} />
              )}
              {item.items.length > 0 && <NavList items={item.items} />}
            </li>
          );
        })}
    </ul>
  );
}

async function LinkName({ slug }: { slug: string }) {
  const fmt = await docs.getFrontmatter({ slug });
  const temp = slug.split("/");
  const path = temp.slice(2).join("/");
  const locale = temp[1];
  const href = "/" + locale + "/docs/" + path;
  return <Link href={href}>{fmt["title"]}</Link>;
}
