"use client";

import { EXAMPLEROUTES, ROUTES } from "@/lib/routes-config";
import SubLink from "./sublink";
import { usePathname } from "next/navigation";

export function DocsMenu({ isSheet = false }) {
  const pathname = usePathname();
  if (!pathname.startsWith("/docs")) return null;

  return (
    <div className="flex flex-col gap-3.5 mt-5 pr-2 pb-6">
      {ROUTES.map((item, index) => {
        const modifiedItems = {
          ...item,
          href: `/docs${item.href}`,
          level: 0,
          isSheet,
        };
        return <SubLink key={item.title + index} {...modifiedItems} />;
      })}
    </div>
  );
}
export function ExampleMenu({ isSheet = false }) {
  const pathname = usePathname();
  if (!pathname.startsWith("/examples")) return null;

  return (
    <div className="flex flex-col gap-3.5 mt-5 pr-2 pb-6">
      {EXAMPLEROUTES.map((item, index) => {
        const modifiedItems = {
          ...item,
          href: `/examples${item.href}`,
          level: 0,
          isSheet,
        };
        return <SubLink key={item.title + index} {...modifiedItems} />;
      })}
    </div>
  );
}
