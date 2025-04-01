import { Link as _Link } from "@tanstack/react-router";
import { type ComponentProps } from "react";

export default function Linkw({ href, ...props }: ComponentProps<"a">) {
  if (!href) return null;
  return (
    <_Link to={href} {...props} target="_blank" rel="noopener noreferrer" />
  );
}
