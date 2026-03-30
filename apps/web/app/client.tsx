"use client";

import { MdxClient, type SerializedSource } from "@ariadocs/react/client";

type SerializedProps = { serialized: SerializedSource };

export default function Client({ serialized }: SerializedProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <MdxClient serialized={serialized} />
    </div>
  );
}
