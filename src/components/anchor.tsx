"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps } from "react";

type AnchorProps = ComponentProps<typeof Link>;

export default function Anchor({ className = "", ...props }: AnchorProps) {
  const path = usePathname();
  console.log(path, props.href);

  return (
    <Link
      className={`${className} ${
        path == props.href ? "dark:text-[#3b82f6]" : ""
      }`}
      {...props}
    />
  );
}
