"use client";

import { Dictionary } from "@/lib/dictionaries";
import { createContext, PropsWithChildren, useContext } from "react";

export function ClientDictionary({
  children,
  dict,
}: PropsWithChildren<{ dict: Dictionary }>) {
  return (
    <DictionaryContext.Provider value={{ dict }}>
      {children}
    </DictionaryContext.Provider>
  );
}

const DictionaryContext = createContext<{ dict: Dictionary } | null>(null);

export function useDictionary() {
  const val = useContext(DictionaryContext);
  if (!val) throw new Error("useDictionary must be used within a DictProvider");
  return val.dict;
}
