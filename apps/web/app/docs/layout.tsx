import { docs } from "@/ariadocs";
import type { NavItem } from "@ariadocs/react/types";
import Link from "next/link";

function Sidebar({ items }: { items: NavItem[] }) {
  const visibleItems = items.filter((item) => item.nav);

  return (
    <aside className="not-prose fixed left-20 top-20 hidden w-56 lg:block">
      <nav className="text-sm">
        <ul className="space-y-2">
          {visibleItems.map((item) => (
            <li key={item.href}>
              <Link
                href={`/docs${item.href}`}
                className="font-medium hover:text-foreground"
              >
                {item.title}
              </Link>
              {item.items.length > 0 && (
                <ul className="ml-3 mt-1 space-y-1 border-l pl-3">
                  {item.items
                    .filter((child) => child.nav)
                    .map((child) => (
                      <li key={child.href}>
                        <Link
                          href={`/docs${child.href}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {child.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = await docs.getNavItems();

  return (
    <div className="relative mx-auto">
      <Sidebar items={navItems} />
      <div className="mx-auto max-w-3xl">{children}</div>
    </div>
  );
}