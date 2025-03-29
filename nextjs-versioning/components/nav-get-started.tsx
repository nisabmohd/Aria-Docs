"use client";

import { getRoutesFlatten } from "@/lib/routes-config";
import { useVersion } from "./context/version";
import Anchor from "./anchor";

export default function NavGetStarted() {
  const { currentVersion } = useVersion();
  const routes = getRoutesFlatten(currentVersion);
  return (
    <Anchor
      activeClassName="text-primary font-semibold"
      href={`/docs/${currentVersion}${routes[0].href}`}
    >
      Documentation
    </Anchor>
  );
}
