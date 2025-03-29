import { Link as _Link } from "react-router";
import { type ComponentProps } from "react";

export default function Link({ href, ...props }: ComponentProps<"a">) {
  if (!href) return null;
  return (
    <_Link to={href} {...props} target="_blank" rel="noopener noreferrer" />
  );
}
