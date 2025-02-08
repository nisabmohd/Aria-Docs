"use client";

import { ComponentProps } from "react";
import Anchor from "./anchor";
import useLocale from "./hooks/useLocale";

type LangLinkProps = ComponentProps<typeof Anchor>;

export default function LangLink({ href, ...rest }: LangLinkProps) {
  const locale = useLocale();
  const newHref = href.toString().includes("http") ? href : `/${locale}${href}`;

  return <Anchor {...rest} href={newHref} />;
}
