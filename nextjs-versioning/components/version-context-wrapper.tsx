"use client";

import dynamic from "next/dynamic";
import { PropsWithChildren } from "react";

const VersionContextProvider = dynamic(
  () => import("@/components/context/version"),
  { ssr: false }
);

export default function VersionContextWrapper({ children }: PropsWithChildren) {
  return <VersionContextProvider>{children}</VersionContextProvider>;
}
