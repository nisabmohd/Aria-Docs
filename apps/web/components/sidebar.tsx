"use client";

import type { NavItem } from "@ariadocs/react/types";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

function SidebarContent({
  items,
  onLinkClick,
}: {
  items: NavItem[];
  onLinkClick?: () => void;
}) {
  const visibleItems = items.filter((item) => item.nav);

  return (
    <nav className="text-sm">
      <ul className="space-y-2">
        {visibleItems.map((item) => (
          <li key={item.href}>
            <Link
              href={`/docs${item.href}`}
              className="font-medium hover:text-foreground"
              onClick={onLinkClick}
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
                        onClick={onLinkClick}
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
  );
}

export function Sidebar({ items }: { items: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "not-prose fixed left-0 top-0 z-40 h-full w-64 transform bg-background p-6 pt-16 transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent items={items} onLinkClick={() => setIsOpen(false)} />
      </aside>

      <aside className="not-prose fixed left-20 top-14 hidden w-56 lg:block">
        <SidebarContent items={items} />
      </aside>
    </>
  );
}
