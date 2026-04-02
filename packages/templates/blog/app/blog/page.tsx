import { docs } from "@/ariadocs";
import { NavItem } from "@ariadocs/react";
import Link from "next/link";

export default async function BlogList() {
  const navItems = await docs.getNavItems();
  return (
    <div>
      <h2>Blog list</h2>
      <div className="flex flex-col gap-3 mt-5">
        {navItems.map((it) => (
          <BlogTitle key={it.href} item={it} />
        ))}
      </div>
    </div>
  );
}

async function BlogTitle({ item }: { item: NavItem }) {
  const slug = item.href.split("/").filter(Boolean)[0];
  const fmt = await docs.getFrontmatter({ slug });
  return (
    <Link className="underline" href={"/blog" + item.href}>
      {fmt.title}
    </Link>
  );
}
