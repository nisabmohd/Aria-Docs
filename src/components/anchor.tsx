"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps } from "react";

type AnchorProps = ComponentProps<typeof Link> & { absolute?: boolean };

export default function Anchor({
  absolute,
  className = "",
  ...props
}: AnchorProps) {
  const path = usePathname();
  const isMatch = absolute
    ? props.href.toString().split("/")[1] == path.split("/")[1]
    : path === props.href;
  return (
    <Link className={`${className} ${isMatch ? "anchor" : ""}`} {...props} />
  );
}
