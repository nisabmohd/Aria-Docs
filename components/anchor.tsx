"use client";

import { cn } from "@/lib/utils";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps } from "react";

type AnchorProps = ComponentProps<typeof Link> & {
  absolute?: boolean;
  activeClassName?: string;
};

export default function Anchor({
  absolute,
  className = "",
  activeClassName = "",
  ...props
}: AnchorProps) {
  const path = usePathname();
  const isMatch = absolute
    ? props.href.toString().split("/")[1] == path.split("/")[1]
    : path === props.href;

  return (
    <Link className={cn(className, isMatch && activeClassName)} {...props} />
  );
}
