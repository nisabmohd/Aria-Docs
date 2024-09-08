"use client";

import Link from "next/link";
import { getRoutesFlatten } from "@/lib/routes-config";
import { useVersion } from "./context/version";

export default function NavGetStarted() {
  const { currentVersion } = useVersion();
  const routes = getRoutesFlatten(currentVersion);
  return (
    <Link href={`/docs/${currentVersion}${routes[0].href}`}>Documentation</Link>
  );
}
