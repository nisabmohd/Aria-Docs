"use client";

import { createContext, PropsWithChildren, useContext, useState } from "react";

import { availableVersions, Version } from "@/lib/routes-config";

type VersionContextType = {
  currentVersion: Version;
  changeVersion: (v: Version) => void;
};

const VersionContext = createContext<VersionContextType | null>(null);

const localStorageVersionKey = "_version";

export default function VersionContextProvider({
  children,
}: PropsWithChildren) {
  const [currentVersion, setCurrentVersion] = useState<Version>(() => {
    return (localStorage.getItem(localStorageVersionKey) ??
      availableVersions[0]) as Version;
  });

  function changeVersion(v: Version) {
    localStorage.setItem(localStorageVersionKey, v);
    setCurrentVersion(v);
  }

  return (
    <VersionContext.Provider value={{ currentVersion, changeVersion }}>
      {children}
    </VersionContext.Provider>
  );
}

export function useVersion() {
  const val = useContext(VersionContext);
  if (!val) throw new Error("The component not wrapped to Version context...");
  return val;
}
