"use client"; // Error components must be Client Components
import { useDictionary } from "@/components/dict-provider";
import { useEffect } from "react";

export default function Error({ error }: { error: Error }) {
  const dict = useDictionary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <p>{dict.error.something_went_wrong}</p>
      <p>{dict.error.sub_text}</p>
    </div>
  );
}
