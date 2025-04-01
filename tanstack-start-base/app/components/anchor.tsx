import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";
import { Link, useLocation } from "@tanstack/react-router";

type AnchorProps = ComponentProps<typeof Link> & {
  absolute?: boolean;
  activeClassName?: string;
};

export default function Anchor({
  absolute,
  className = "",
  activeClassName = "",
  children,
  ...props
}: AnchorProps) {
  const { pathname: path } = useLocation();

  if (!props.to) throw new Error("Invalid to");

  let isMatch = absolute
    ? props.to.toString().split("/")[1] == path.split("/")[1]
    : path === props.to;

  if (props.to.toString().includes("http")) isMatch = false;

  return (
    <Link className={cn(className, isMatch && activeClassName)} {...props}>
      {children}
    </Link>
  );
}
