"use client";

import type { NavItem } from "@ariadocs/react/types";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";

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
            {item.items.length > 0 ? (
              <span className="font-medium">{item.title}</span>
            ) : (
              <Link
                href={`/docs${item.href}`}
                className="font-medium hover:text-foreground"
                onClick={onLinkClick}
              >
                {item.title}
              </Link>
            )}
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
  return (
    <>
      {/* Mobile Sidebar with Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden -ml-2.5 sticky top-8"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-6 pt-16">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent items={items} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="not-prose fixed left-20 top-14 hidden w-56 lg:block">
        <SidebarContent items={items} />
      </aside>
    </>
  );
}
