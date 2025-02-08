"use client";

import { ComponentProps } from "react";
import Anchor from "./anchor";
import useLocale from "./hooks/useLocale";

type LocalizedLinkProps = ComponentProps<typeof Anchor>;

export default function LocalizedLink({ href, ...rest }: LocalizedLinkProps) {
  const locale = useLocale();
  const newHref = href.toString().includes("http") ? href : `/${locale}${href}`;

  return <Anchor {...rest} href={newHref} />;
}
