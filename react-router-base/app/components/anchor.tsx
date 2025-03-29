import { cn } from "~/lib/utils";
import { type ComponentProps } from "react";
import { Link, useLocation } from "react-router";

type AnchorProps = ComponentProps<typeof Link> & {
  absolute?: boolean;
  activeClassName?: string;
  disabled?: boolean;
};

export default function Anchor({
  absolute,
  className = "",
  activeClassName = "",
  disabled,
  children,
  ...props
}: AnchorProps) {
  const { pathname: path } = useLocation();
  let isMatch = absolute
    ? props.to.toString().split("/")[1] == path.split("/")[1]
    : path === props.to;

  if (props.to.toString().includes("http")) isMatch = false;

  if (disabled)
    return (
      <div className={cn(className, "cursor-not-allowed")}>{children}</div>
    );
  return (
    <Link className={cn(className, isMatch && activeClassName)} {...props}>
      {children}
    </Link>
  );
}
