"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps } from "react";

type AnchorProps = ComponentProps<typeof Link>;

export default function Anchor({ className = "", ...props }: AnchorProps) {
  const path = usePathname();
  return (
    <Link
      className={`${className} ${path === props.href ? "anchor" : ""}`}
      {...props}
    />
  );
}
