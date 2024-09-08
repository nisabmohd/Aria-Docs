"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  availableVersions,
  getRoutesFlatten,
  Version,
} from "@/lib/routes-config";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useVersion } from "./context/version";

function isPathSameVersion(path: string, v: Version) {
  return path.split("/")[2] == v;
}

export default function VersionManager() {
  const { changeVersion, currentVersion } = useVersion();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // can be made more complex by moving to same page on other version if exist or parent of that section or first page
    // currently by default moves to first page
    if (
      !pathname.startsWith("/docs") ||
      isPathSameVersion(pathname, currentVersion)
    )
      return;
    const routes = getRoutesFlatten(currentVersion);
    const path = `/docs/${currentVersion}${routes[0].href}`;
    router.push(path);
  }, [currentVersion, router, pathname]);

  return (
    <Select
      value={currentVersion}
      onValueChange={(v: Version) => changeVersion(v)}
    >
      <SelectTrigger className="sm:w-fit w-full border-none font-code font-medium bg-muted rounded-full text-xs h-8 pl-5">
        <SelectValue placeholder="Version" />
      </SelectTrigger>
      <SelectContent side="bottom" className="font-code">
        {availableVersions.map((v) => (
          <SelectItem key={v} value={v}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
