"use client";

import {
  type MDXClientSerializedProps,
  MdxClient,
} from "@ariadocs/react/components/client";

type SerializedProps = Pick<MDXClientSerializedProps, "serialized">;

export default function Client({ serialized }: SerializedProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <MdxClient serialized={serialized} />
    </div>
  );
}
