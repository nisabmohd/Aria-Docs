"use client";

import { getRoutesForVersion } from "@/lib/routes-config";
import SubLink from "./sublink";
import { usePathname } from "next/navigation";
import { useVersion } from "./context/version";

export default function DocsMenu({ isSheet = false }) {
  const { currentVersion } = useVersion();
  const pathname = usePathname();
  if (!pathname.startsWith("/docs")) return null;
  const routes = getRoutesForVersion(currentVersion);

  return (
    <div className="flex flex-col gap-3.5 mt-5">
      {routes.map((item, index) => {
        const modifiedItems = {
          ...item,
          href: `/docs/${currentVersion}${item.href}`,
          level: 0,
          isSheet,
        };
        return <SubLink key={item.title + index} {...modifiedItems} />;
      })}
    </div>
  );
}
