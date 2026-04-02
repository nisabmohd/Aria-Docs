"use client";

import type { Dict } from "@/lib/i18n";
import { createContext, PropsWithChildren, useContext } from "react";

export function ClientDictionaryProvider({
  children,
  dict,
}: PropsWithChildren<{ dict: Dict }>) {
  return (
    <DictionaryContext.Provider value={{ dict }}>
      {children}
    </DictionaryContext.Provider>
  );
}

const DictionaryContext = createContext<{ dict: Dict } | null>(null);

export function useDictionary() {
  const val = useContext(DictionaryContext);
  if (!val) throw new Error("...");
  return val.dict;
}
